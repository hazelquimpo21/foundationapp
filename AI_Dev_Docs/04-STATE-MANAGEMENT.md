# Foundation Studio - State Management

## Philosophy

**Supabase is the source of truth.** Local state handles:
- Draft inputs (before user commits)
- UI state (current step, modals, loading)
- Optimistic updates
- Cached data from Supabase

We use **Zustand** for its simplicity and lack of boilerplate.

---

## Store Structure

Split into focused stores rather than one monolith:

```
/lib/stores
  ├── useAuthStore.ts       → Auth state
  ├── useProjectStore.ts    → Current project data
  ├── useOnboardStore.ts    → Onboarding flow state
  └── useAnalyzerStore.ts   → Analyzer status
```

---

## Auth Store

Handles authentication state synced with Supabase Auth.

```typescript
// /lib/stores/useAuthStore.ts

interface AuthState {
  member: Member | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  setMember: (member: Member | null) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  member: null,
  isLoading: true,
  isAuthenticated: false,

  setMember: (member) => set({ 
    member, 
    isLoading: false,
    isAuthenticated: !!member 
  }),

  signOut: async () => {
    await supabase.auth.signOut()
    set({ member: null, isAuthenticated: false })
  }
}))
```

---

## Project Store

Manages the currently active brand project.

```typescript
// /lib/stores/useProjectStore.ts

interface ProjectState {
  // Current project
  project: BrandProject | null
  isLoading: boolean
  
  // Portfolio
  portfolio: BrandProject[]
  portfolioLoading: boolean
  
  // Actions
  loadProject: (id: string) => Promise<void>
  loadPortfolio: () => Promise<void>
  updateProject: (updates: Partial<BrandProject>) => Promise<void>
  createProject: (data: NewProjectData) => Promise<string>
  
  // Optimistic updates
  optimisticUpdate: (updates: Partial<BrandProject>) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  isLoading: false,
  portfolio: [],
  portfolioLoading: false,

  loadProject: async (id) => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('brand_projects')
      .select('*')
      .eq('id', id)
      .single()
    
    if (data) set({ project: data, isLoading: false })
  },

  loadPortfolio: async () => {
    set({ portfolioLoading: true })
    const { data } = await supabase
      .from('brand_projects')
      .select('*')
      .order('updated_at', { ascending: false })
    
    set({ portfolio: data || [], portfolioLoading: false })
  },

  updateProject: async (updates) => {
    const { project } = get()
    if (!project) return

    // Optimistic update
    set({ project: { ...project, ...updates } })

    // Persist
    await supabase
      .from('brand_projects')
      .update(updates)
      .eq('id', project.id)
  },

  createProject: async (data) => {
    const { data: newProject, error } = await supabase
      .from('brand_projects')
      .insert(data)
      .select()
      .single()
    
    if (newProject) {
      set({ project: newProject })
      return newProject.id
    }
    throw error
  },

  optimisticUpdate: (updates) => {
    const { project } = get()
    if (project) {
      set({ project: { ...project, ...updates } })
    }
  }
}))
```

---

## Onboard Store

Handles the onboarding flow state and draft inputs.

```typescript
// /lib/stores/useOnboardStore.ts

type OnboardStep = 
  | 'setup' 
  | 'assets' 
  | 'story' 
  | 'personality' 
  | 'preferences' 
  | 'hub' 
  | 'complete'

interface OnboardState {
  // Flow
  currentStep: OnboardStep
  projectType: 'primary' | 'portfolio'
  
  // Draft Mad Libs (before save)
  draftMadLibs: {
    repName?: string
    repRole?: string
    brandName?: string
    brandLocation?: string
    yearFounded?: string
    foundingReason?: string
    customerDescription?: string
    coreOffering?: string
  }
  
  // Draft Word Banks
  draftBrandWords: string[]
  draftCustomerWords: string[]
  
  // Draft Sliders
  draftSliders: {
    commStyle?: number
    pricePosition?: number
  }
  
  // Actions
  setStep: (step: OnboardStep) => void
  setProjectType: (type: 'primary' | 'portfolio') => void
  
  updateMadLibs: (field: string, value: string) => void
  toggleBrandWord: (word: string) => void
  toggleCustomerWord: (word: string) => void
  setSlider: (key: string, value: number) => void
  
  saveMadLibsL1: () => Promise<void>
  saveWordBanks: () => Promise<void>
  saveSliders: () => Promise<void>
  
  resetDrafts: () => void
}

const WORD_LIMITS = { min: 5, max: 7 }

export const useOnboardStore = create<OnboardState>((set, get) => ({
  currentStep: 'setup',
  projectType: 'portfolio',
  
  draftMadLibs: {},
  draftBrandWords: [],
  draftCustomerWords: [],
  draftSliders: {},

  setStep: (step) => set({ currentStep: step }),
  setProjectType: (type) => set({ projectType: type }),

  updateMadLibs: (field, value) => {
    set((state) => ({
      draftMadLibs: { ...state.draftMadLibs, [field]: value }
    }))
  },

  toggleBrandWord: (word) => {
    set((state) => {
      const words = [...state.draftBrandWords]
      const index = words.indexOf(word)
      
      if (index > -1) {
        words.splice(index, 1)
      } else if (words.length < WORD_LIMITS.max) {
        words.push(word)
      }
      
      return { draftBrandWords: words }
    })
  },

  toggleCustomerWord: (word) => {
    set((state) => {
      const words = [...state.draftCustomerWords]
      const index = words.indexOf(word)
      
      if (index > -1) {
        words.splice(index, 1)
      } else if (words.length < WORD_LIMITS.max) {
        words.push(word)
      }
      
      return { draftCustomerWords: words }
    })
  },

  setSlider: (key, value) => {
    set((state) => ({
      draftSliders: { ...state.draftSliders, [key]: value }
    }))
  },

  saveMadLibsL1: async () => {
    const { draftMadLibs } = get()
    const projectId = useProjectStore.getState().project?.id
    if (!projectId) return

    // Save raw input
    await supabase.from('brand_inputs').insert({
      brand_project_id: projectId,
      input_type: 'madlibs_l1',
      input_data: draftMadLibs
    })

    // Update project fields
    await useProjectStore.getState().updateProject({
      rep_name: draftMadLibs.repName,
      rep_role: draftMadLibs.repRole,
      brand_name: draftMadLibs.brandName,
      brand_location: draftMadLibs.brandLocation,
      year_founded: parseInt(draftMadLibs.yearFounded || '0'),
      founding_reason: draftMadLibs.foundingReason,
      customer_description: draftMadLibs.customerDescription,
      core_offering: draftMadLibs.coreOffering,
      current_step: 'personality'
    })

    // Trigger analyzer
    await triggerAnalyzer(projectId, 'narrative')
  },

  saveWordBanks: async () => {
    const { draftBrandWords, draftCustomerWords } = get()
    const projectId = useProjectStore.getState().project?.id
    if (!projectId) return

    // Save raw inputs
    await supabase.from('brand_inputs').insert([
      { brand_project_id: projectId, input_type: 'word_bank_brand', input_data: draftBrandWords },
      { brand_project_id: projectId, input_type: 'word_bank_customer', input_data: draftCustomerWords }
    ])

    // Update project
    await useProjectStore.getState().updateProject({
      brand_words: draftBrandWords,
      customer_words: draftCustomerWords,
      current_step: 'preferences'
    })

    // Trigger analyzer
    await triggerAnalyzer(projectId, 'voice')
  },

  saveSliders: async () => {
    const { draftSliders } = get()
    const projectId = useProjectStore.getState().project?.id
    if (!projectId) return

    await useProjectStore.getState().updateProject({
      comm_style: draftSliders.commStyle,
      price_position: draftSliders.pricePosition,
      current_step: 'hub'
    })
  },

  resetDrafts: () => set({
    draftMadLibs: {},
    draftBrandWords: [],
    draftCustomerWords: [],
    draftSliders: {}
  })
}))
```

---

## Analyzer Store

Handles real-time analyzer status updates.

```typescript
// /lib/stores/useAnalyzerStore.ts

interface AnalyzerRun {
  id: string
  analyzer_type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  raw_analysis?: string
  parsed_fields?: Record<string, any>
  error_message?: string
}

interface AnalyzerState {
  runs: Record<string, AnalyzerRun>  // keyed by analyzer_type
  isSubscribed: boolean
  
  // Actions
  subscribeToProject: (projectId: string) => void
  unsubscribe: () => void
  getLatestRun: (analyzerType: string) => AnalyzerRun | null
  isRunning: (analyzerType: string) => boolean
  isComplete: (analyzerType: string) => boolean
}

let subscription: RealtimeChannel | null = null

export const useAnalyzerStore = create<AnalyzerState>((set, get) => ({
  runs: {},
  isSubscribed: false,

  subscribeToProject: (projectId) => {
    // Clean up existing
    if (subscription) subscription.unsubscribe()

    // Load existing runs
    supabase
      .from('analyzer_runs')
      .select('*')
      .eq('brand_project_id', projectId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          const runs: Record<string, AnalyzerRun> = {}
          data.forEach(run => {
            // Keep only latest per type
            if (!runs[run.analyzer_type]) {
              runs[run.analyzer_type] = run
            }
          })
          set({ runs })
        }
      })

    // Subscribe to changes
    subscription = supabase
      .channel(`analyzers-${projectId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'analyzer_runs',
        filter: `brand_project_id=eq.${projectId}`
      }, (payload) => {
        const run = payload.new as AnalyzerRun
        set((state) => ({
          runs: { ...state.runs, [run.analyzer_type]: run }
        }))
      })
      .subscribe()

    set({ isSubscribed: true })
  },

  unsubscribe: () => {
    if (subscription) {
      subscription.unsubscribe()
      subscription = null
    }
    set({ isSubscribed: false, runs: {} })
  },

  getLatestRun: (analyzerType) => {
    return get().runs[analyzerType] || null
  },

  isRunning: (analyzerType) => {
    const run = get().runs[analyzerType]
    return run?.status === 'running' || run?.status === 'pending'
  },

  isComplete: (analyzerType) => {
    return get().runs[analyzerType]?.status === 'completed'
  }
}))
```

---

## Helper: Trigger Analyzer

Utility function to kick off an analyzer run.

```typescript
// /lib/analyzers/trigger.ts

export async function triggerAnalyzer(
  projectId: string, 
  analyzerType: string
): Promise<void> {
  // Create pending run record
  await supabase.from('analyzer_runs').insert({
    brand_project_id: projectId,
    analyzer_type: analyzerType,
    status: 'pending'
  })

  // Invoke edge function
  await supabase.functions.invoke(`analyzer-${analyzerType}`, {
    body: { projectId }
  })
}
```

---

## Usage Patterns

### In a Page Component
```typescript
export default function StoryPage() {
  const { draftMadLibs, updateMadLibs, saveMadLibsL1 } = useOnboardStore()
  const { project } = useProjectStore()
  
  const handleContinue = async () => {
    await saveMadLibsL1()
    router.push(`/onboard/${project.id}/personality`)
  }
  
  return (
    <MadLibsForm 
      values={draftMadLibs}
      onChange={updateMadLibs}
      onSubmit={handleContinue}
    />
  )
}
```

### Subscribing to Analyzer Updates
```typescript
export default function HubPage({ projectId }: { projectId: string }) {
  const { subscribeToProject, unsubscribe, runs } = useAnalyzerStore()
  
  useEffect(() => {
    subscribeToProject(projectId)
    return () => unsubscribe()
  }, [projectId])
  
  return (
    <div>
      {Object.entries(runs).map(([type, run]) => (
        <AnalyzerCard key={type} type={type} run={run} />
      ))}
    </div>
  )
}
```
