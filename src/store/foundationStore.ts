/**
 * ✨ Foundation Store
 *
 * Manages the brand foundation data (field values and progress).
 * Tracks completion across buckets and handles inference responses.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  FoundationField,
  FieldDefinition,
  FieldBucket,
  BucketProgress,
  ConfidenceLevel,
  PendingInference,
} from '@/lib/types';
import {
  getFoundationFields,
  getFieldBuckets,
  getFieldDefinitions,
  upsertFoundationField,
  getPendingInferences,
  updateInferenceStatus,
} from '@/lib/supabase/queries';
import { log, calculatePercent } from '@/lib/utils';

// ============================================
// 📦 Store Types
// ============================================

interface FoundationState {
  // Schema (loaded once)
  buckets: FieldBucket[];
  fieldDefinitions: FieldDefinition[];

  // Data
  fields: Record<string, FoundationField>;
  pendingInferences: PendingInference[];

  // Computed
  bucketProgress: BucketProgress[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSchema: () => Promise<void>;
  loadFoundation: (businessId: string) => Promise<void>;
  loadInferences: (sessionId: string) => Promise<void>;
  updateField: (
    businessId: string,
    fieldId: string,
    value: string | null,
    confidence: ConfidenceLevel
  ) => Promise<void>;
  respondToInference: (
    businessId: string,
    inferenceId: string,
    action: 'confirm' | 'reject' | 'edit',
    editedValue?: string
  ) => Promise<void>;
  calculateProgress: () => void;
  reset: () => void;
}

// ============================================
// 🏗️ Store Implementation
// ============================================

export const useFoundationStore = create<FoundationState>()(
  devtools(
    (set, get) => ({
      // Initial state
      buckets: [],
      fieldDefinitions: [],
      fields: {},
      pendingInferences: [],
      bucketProgress: [],
      isLoading: false,
      error: null,

      /**
       * Load bucket and field definitions (schema).
       */
      loadSchema: async () => {
        log.info('📚 Loading schema');

        try {
          const [buckets, fieldDefinitions] = await Promise.all([
            getFieldBuckets(),
            getFieldDefinitions(),
          ]);

          set({ buckets, fieldDefinitions });
          log.info('✅ Schema loaded', {
            buckets: buckets.length,
            fields: fieldDefinitions.length,
          });
        } catch (error) {
          log.error('❌ Failed to load schema', { error });
          set({ error: 'Failed to load configuration' });
        }
      },

      /**
       * Load foundation field values for a business.
       */
      loadFoundation: async (businessId: string) => {
        log.info('📂 Loading foundation', { businessId });
        set({ isLoading: true, error: null });

        try {
          // Ensure schema is loaded
          if (get().buckets.length === 0) {
            await get().loadSchema();
          }

          // Fetch field values
          const fieldsList = await getFoundationFields(businessId);

          // Convert to map for easy lookup
          const fields: Record<string, FoundationField> = {};
          for (const field of fieldsList) {
            fields[field.field_id] = field;
          }

          set({ fields, isLoading: false });

          // Calculate progress
          get().calculateProgress();

          log.info('✅ Foundation loaded', { fieldCount: fieldsList.length });
        } catch (error) {
          log.error('❌ Failed to load foundation', { error });
          set({ error: 'Failed to load foundation data', isLoading: false });
        }
      },

      /**
       * Load pending inferences for a session.
       */
      loadInferences: async (sessionId: string) => {
        log.info('💡 Loading inferences', { sessionId });

        try {
          const inferences = await getPendingInferences(sessionId);
          const { fieldDefinitions } = get();

          // Map to PendingInference format
          const pendingInferences: PendingInference[] = inferences.map((inf) => {
            const field = fieldDefinitions.find((f) => f.id === inf.field_id);
            return {
              id: inf.id,
              fieldId: inf.field_id,
              fieldName: field?.display_name || inf.field_id,
              bucketId: field?.bucket_id || 'unknown',
              inferredValue: inf.inferred_value,
              displayText: inf.display_text,
              confidence: inf.confidence as 'low' | 'medium' | 'high',
            };
          });

          set({ pendingInferences });
          log.info('✅ Inferences loaded', { count: pendingInferences.length });
        } catch (error) {
          log.error('❌ Failed to load inferences', { error });
        }
      },

      /**
       * Update a field value.
       */
      updateField: async (
        businessId: string,
        fieldId: string,
        value: string | null,
        confidence: ConfidenceLevel
      ) => {
        log.info('✏️ Updating field', { fieldId, confidence });

        try {
          const field = await upsertFoundationField(
            businessId,
            fieldId,
            value,
            null, // valueJson
            confidence,
            'direct_input',
            []
          );

          // Update local state
          set((state) => ({
            fields: {
              ...state.fields,
              [fieldId]: field,
            },
          }));

          // Recalculate progress
          get().calculateProgress();

          log.info('✅ Field updated', { fieldId });
        } catch (error) {
          log.error('❌ Failed to update field', { error });
          throw error;
        }
      },

      /**
       * Respond to an inference (confirm/reject/edit).
       */
      respondToInference: async (
        businessId: string,
        inferenceId: string,
        action: 'confirm' | 'reject' | 'edit',
        editedValue?: string
      ) => {
        log.info('💡 Responding to inference', { inferenceId, action });

        const { pendingInferences } = get();
        const inference = pendingInferences.find((i) => i.id === inferenceId);

        if (!inference) {
          log.warn('Inference not found', { inferenceId });
          return;
        }

        try {
          // Update inference status in database
          await updateInferenceStatus(
            inferenceId,
            action === 'confirm' ? 'confirmed' : action === 'reject' ? 'rejected' : 'edited',
            editedValue
          );

          // If confirmed or edited, update the field
          if (action === 'confirm' || action === 'edit') {
            const finalValue = action === 'edit' ? editedValue! : inference.inferredValue;

            await upsertFoundationField(
              businessId,
              inference.fieldId,
              finalValue,
              null,
              'high', // Confirmed inferences get high confidence
              action === 'confirm' ? 'confirmed_inference' : 'edited',
              []
            );

            // Update local fields
            set((state) => ({
              fields: {
                ...state.fields,
                [inference.fieldId]: {
                  ...state.fields[inference.fieldId],
                  value: finalValue,
                  confidence: 'high',
                } as FoundationField,
              },
            }));
          }

          // Remove from pending
          set((state) => ({
            pendingInferences: state.pendingInferences.filter((i) => i.id !== inferenceId),
          }));

          // Recalculate progress
          get().calculateProgress();

          log.info('✅ Inference processed', { inferenceId, action });
        } catch (error) {
          log.error('❌ Failed to process inference', { error });
          throw error;
        }
      },

      /**
       * Calculate bucket completion progress.
       */
      calculateProgress: () => {
        const { buckets, fieldDefinitions, fields } = get();

        const bucketProgress: BucketProgress[] = buckets.map((bucket) => {
          // Get fields for this bucket
          const bucketFields = fieldDefinitions.filter((f) => f.bucket_id === bucket.id);
          const totalFields = bucketFields.length;

          // Count completed fields (has value with confidence > none)
          const completedFields = bucketFields.filter((f) => {
            const field = fields[f.id];
            return field && field.value && field.confidence !== 'none';
          }).length;

          const percent = calculatePercent(completedFields, totalFields);

          return {
            bucketId: bucket.id,
            bucketName: bucket.display_name,
            icon: bucket.icon,
            tier: bucket.tier,
            isRequired: bucket.is_required,
            completionPercent: percent,
            fieldsCompleted: completedFields,
            fieldsTotal: totalFields,
            meetsMinimum: percent >= bucket.min_completion_percent,
          };
        });

        set({ bucketProgress });
      },

      /**
       * Reset the store.
       */
      reset: () => {
        log.info('🔄 Resetting foundation store');
        set({
          fields: {},
          pendingInferences: [],
          bucketProgress: [],
          isLoading: false,
          error: null,
        });
      },
    }),
    { name: 'foundation-store' }
  )
);

// ============================================
// 🎣 Selector Hooks
// ============================================

/** Get a single field value */
export const useFieldValue = (fieldId: string) =>
  useFoundationStore((s) => s.fields[fieldId]?.value);

/** Get field confidence */
export const useFieldConfidence = (fieldId: string) =>
  useFoundationStore((s) => s.fields[fieldId]?.confidence || 'none');

/** Get progress for a specific bucket */
export const useBucketProgress = (bucketId: string) =>
  useFoundationStore((s) => s.bucketProgress.find((b) => b.bucketId === bucketId));

/** Get overall completion percentage */
export const useOverallProgress = () =>
  useFoundationStore((s) => {
    const required = s.bucketProgress.filter((b) => b.isRequired);
    if (required.length === 0) return 0;
    const sum = required.reduce((acc, b) => acc + b.completionPercent, 0);
    return Math.round(sum / required.length);
  });

/** Check if required buckets meet minimum */
export const useIsFoundationReady = () =>
  useFoundationStore((s) =>
    s.bucketProgress.filter((b) => b.isRequired).every((b) => b.meetsMinimum)
  );

/** Get count of pending inferences */
export const usePendingInferenceCount = () =>
  useFoundationStore((s) => s.pendingInferences.length);
