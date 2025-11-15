'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Lightbulb, Compass, TrendingUp, Star, CheckCircle, AlertCircle, HelpCircle, Sparkles, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface VisionMissionData {
  mission_statement: string;
  vision_statement: string;
  core_values: string[];
}

interface CoreValue {
  name: string;
  category: string;
  weStatement: string;
}

const CORE_VALUES_LIBRARY: CoreValue[] = [
  // Customer-Focused
  { name: 'Customer Obsession', category: 'Customer-Focused', weStatement: 'We put customers at the center of every decision we make' },
  { name: 'Exceptional Service', category: 'Customer-Focused', weStatement: 'We go above and beyond to exceed customer expectations every time' },
  { name: 'Customer Success', category: 'Customer-Focused', weStatement: 'We measure our success by our customers\' success' },
  { name: 'Listen First', category: 'Customer-Focused', weStatement: 'We listen to understand, not just to respond' },

  // Quality & Excellence
  { name: 'Excellence', category: 'Quality & Excellence', weStatement: 'We deliver exceptional quality in everything we do' },
  { name: 'Continuous Improvement', category: 'Quality & Excellence', weStatement: 'We get better every day and never settle for good enough' },
  { name: 'Attention to Detail', category: 'Quality & Excellence', weStatement: 'We sweat the small stuff because details matter' },
  { name: 'Craftsmanship', category: 'Quality & Excellence', weStatement: 'We take pride in our work and do it right the first time' },

  // Innovation & Growth
  { name: 'Innovation', category: 'Innovation & Growth', weStatement: 'We embrace change and constantly seek better ways of doing things' },
  { name: 'Think Big', category: 'Innovation & Growth', weStatement: 'We set ambitious goals and pursue bold visions' },
  { name: 'Learn Fast', category: 'Innovation & Growth', weStatement: 'We experiment, learn from failures, and adapt quickly' },
  { name: 'Creative Problem-Solving', category: 'Innovation & Growth', weStatement: 'We find innovative solutions to complex challenges' },

  // Integrity & Trust
  { name: 'Integrity', category: 'Integrity & Trust', weStatement: 'We do the right thing when no one\'s watching' },
  { name: 'Honesty', category: 'Integrity & Trust', weStatement: 'We tell the truth, even when it\'s difficult' },
  { name: 'Transparency', category: 'Integrity & Trust', weStatement: 'We communicate openly and share information freely' },
  { name: 'Respect', category: 'Integrity & Trust', weStatement: 'We communicate openly and honestly, we listen and value different points of view' },
  { name: 'Trust', category: 'Integrity & Trust', weStatement: 'We earn trust through our actions and keep our promises' },

  // Team & Culture
  { name: 'Teamwork', category: 'Team & Culture', weStatement: 'We\'ve got each other\'s back every job, every day' },
  { name: 'Collaboration', category: 'Team & Culture', weStatement: 'We win as a team and celebrate success together' },
  { name: 'Support Each Other', category: 'Team & Culture', weStatement: 'We help our teammates succeed and never leave anyone behind' },
  { name: 'Diversity & Inclusion', category: 'Team & Culture', weStatement: 'We value different perspectives and create a place where everyone belongs' },
  { name: 'Fun', category: 'Team & Culture', weStatement: 'We work hard and enjoy the journey together' },

  // Performance & Results
  { name: 'Accountability', category: 'Performance & Results', weStatement: 'We take responsibility for getting the job done right' },
  { name: 'Results-Driven', category: 'Performance & Results', weStatement: 'We focus on outcomes and deliver on our commitments' },
  { name: 'Ownership', category: 'Performance & Results', weStatement: 'We act like owners and take full responsibility for our work' },
  { name: 'Bias for Action', category: 'Performance & Results', weStatement: 'We make decisions quickly and move forward with urgency' },
  { name: 'High Standards', category: 'Performance & Results', weStatement: 'We hold ourselves and each other to the highest standards' },

  // Leadership & Growth
  { name: 'Lead by Example', category: 'Leadership & Growth', weStatement: 'We model the behavior we want to see in others' },
  { name: 'Empower Others', category: 'Leadership & Growth', weStatement: 'We give people the tools, trust, and autonomy to succeed' },
  { name: 'Develop People', category: 'Leadership & Growth', weStatement: 'We invest in growing our people and their capabilities' },
  { name: 'Growth Mindset', category: 'Leadership & Growth', weStatement: 'We believe we can always learn, improve, and grow' },

  // Community & Impact
  { name: 'Give Back', category: 'Community & Impact', weStatement: 'We contribute to our communities and make a positive difference' },
  { name: 'Sustainability', category: 'Community & Impact', weStatement: 'We build for the long term and care about our impact on the world' },
  { name: 'Make a Difference', category: 'Community & Impact', weStatement: 'We do work that matters and leaves things better than we found them' }
];

export default function VisionMissionPage() {
  const router = useRouter();
  const supabase = createClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<{ [key: string]: boolean }>({
    mission: true,
    vision: true,
    values: true
  });
  const [showValuesLibrary, setShowValuesLibrary] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [formData, setFormData] = useState<VisionMissionData>({
    mission_statement: '',
    vision_statement: '',
    core_values: ['', '', '', '', '', '', '', '']
  });

  const toggleHelp = (section: string) => {
    setShowHelp(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCompletionPercentage = (): number => {
    let completed = 0;
    let total = 3;

    if (formData.mission_statement && formData.mission_statement.trim().length > 20) completed++;
    if (formData.vision_statement && formData.vision_statement.trim().length > 20) completed++;

    const filledValues = formData.core_values.filter(v => v.trim().length > 0).length;
    if (filledValues >= 3) completed++;

    return Math.round((completed / total) * 100);
  };

  const addValueFromLibrary = (valueName: string) => {
    const emptyIndex = formData.core_values.findIndex(v => v.trim() === '');
    if (emptyIndex !== -1) {
      const newValues = [...formData.core_values];
      newValues[emptyIndex] = valueName;
      setFormData(prev => ({ ...prev, core_values: newValues }));
      handleFieldChange();
    }
  };

  const categories = ['all', ...Array.from(new Set(CORE_VALUES_LIBRARY.map(v => v.category)))];
  const filteredValues = selectedCategory === 'all'
    ? CORE_VALUES_LIBRARY
    : CORE_VALUES_LIBRARY.filter(v => v.category === selectedCategory);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Load from strategy_data table
      const { data: existingData } = await supabase
        .from('strategy_data')
        .select('vision_mission')
        .eq('user_id', user.id)
        .single();

      if (existingData?.vision_mission) {
        const vmData = existingData.vision_mission as VisionMissionData;

        // Ensure core_values has 8 slots
        const values = [...(vmData.core_values || [])];
        while (values.length < 8) values.push('');

        setFormData({
          ...vmData,
          core_values: values.slice(0, 8)
        });
        lastSavedDataRef.current = JSON.stringify(vmData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading:', error);
      setLoading(false);
    }
  };

  const handleFieldChange = () => {
    setHasUnsavedChanges(true);
    setErrorMessage(null);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveData();
    }, 2000);
  };

  const saveData = async () => {
    const dataToSave = {
      ...formData,
      core_values: formData.core_values.filter(v => v.trim() !== '')
    };

    const currentDataString = JSON.stringify(dataToSave);
    if (currentDataString === lastSavedDataRef.current) {
      setHasUnsavedChanges(false);
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('strategy_data')
        .upsert({
          user_id: user.id,
          vision_mission: dataToSave,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      lastSavedDataRef.current = currentDataString;
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('✅ Vision, Mission & Values saved successfully');
    } catch (error: any) {
      console.error('Error saving:', error);
      setErrorMessage(error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleCoreValueChange = (index: number, value: string) => {
    const newValues = [...formData.core_values];
    newValues[index] = value;
    setFormData(prev => ({ ...prev, core_values: newValues }));
    handleFieldChange();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vision and mission...</p>
        </div>
      </div>
    );
  }

  const completionPercent = getCompletionPercentage();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vision, Mission & Values</h1>
                <p className="mt-2 text-gray-600">
                  Define where you're going and what principles guide your business
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {saving && (
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Save className="h-4 w-4 animate-pulse" />
                  Saving...
                </span>
              )}
              {!saving && lastSaved && (
                <span className="text-sm text-green-600">
                  ✓ Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              {hasUnsavedChanges && !saving && (
                <span className="text-sm text-amber-600">Unsaved changes</span>
              )}
              {errorMessage && (
                <span className="text-sm text-red-600">Error: {errorMessage}</span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">Completion Progress</span>
              <span className="text-gray-900 font-semibold">{completionPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  completionPercent === 100 ? 'bg-green-500' :
                  completionPercent >= 75 ? 'bg-blue-500' :
                  completionPercent >= 50 ? 'bg-yellow-500' :
                  'bg-gray-400'
                }`}
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            {completionPercent < 100 && (
              <p className="text-xs text-gray-500 mt-1">
                Complete all sections to finalize your strategic foundation
              </p>
            )}
            {completionPercent === 100 && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                All sections complete! Your vision, mission & values are defined.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Vision Statement - 5-10 Year BHAG */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Vision Statement (5-10 Year BHAG)</h2>
                  <p className="text-sm text-gray-600">Where will your business be in 5-10 years?</p>
                </div>
              </div>
              <button
                onClick={() => toggleHelp('vision')}
                className="text-gray-400 hover:text-gray-600"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>

            {showHelp.vision && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm font-medium text-gray-800 mb-2">💡 Why This Matters:</p>
                <p className="text-sm text-gray-700 mb-3">
                  Your BHAG (Big Hairy Audacious Goal) is a vivid, inspiring picture of where you want to be in 5-10 years. Make it specific, measurable, and exciting!
                </p>
                <p className="text-sm font-medium text-gray-800 mb-2">✏️ Include these elements:</p>
                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                  <li>Market position (e.g., "#1 in our region")</li>
                  <li>Scale metrics (clients, revenue, team size)</li>
                  <li>Recognition or reputation</li>
                  <li>Impact or difference you'll make</li>
                </ul>
              </div>
            )}

            <textarea
              value={formData.vision_statement}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, vision_statement: e.target.value }));
                handleFieldChange();
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={4}
              placeholder="In 5-10 years, our business will be..."
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {getWordCount(formData.vision_statement)} words
                {getWordCount(formData.vision_statement) < 20 && ' (aim for 30-50 words)'}
              </span>
              {formData.vision_statement.trim().length > 20 && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Complete
                </span>
              )}
            </div>
          </div>

          {/* Mission Statement */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Compass className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Mission Statement</h2>
                  <p className="text-sm text-gray-600">What do you do and who do you serve?</p>
                </div>
              </div>
              <button
                onClick={() => toggleHelp('mission')}
                className="text-gray-400 hover:text-gray-600"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>

            {showHelp.mission && (
              <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-sm font-medium text-gray-800 mb-2">💡 Why This Matters:</p>
                <p className="text-sm text-gray-700 mb-3">
                  Your mission explains what you do today. It should be clear, specific, and actionable.
                </p>
                <p className="text-sm font-medium text-gray-800 mb-2">✏️ Framework:</p>
                <p className="text-sm text-gray-700 italic">
                  "We [what you deliver] to [target customer], enabling them to [benefit/outcome]."
                </p>
              </div>
            )}

            <textarea
              value={formData.mission_statement}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, mission_statement: e.target.value }));
                handleFieldChange();
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              placeholder="What do you do, who do you serve, and how do you create value?"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {getWordCount(formData.mission_statement)} words
                {getWordCount(formData.mission_statement) < 15 && ' (aim for 20-40 words)'}
              </span>
              {formData.mission_statement.trim().length > 20 && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Complete
                </span>
              )}
            </div>
          </div>

          {/* Core Values */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Core Values</h2>
                  <p className="text-sm text-gray-600">What principles guide your decisions?</p>
                </div>
              </div>
              <button
                onClick={() => toggleHelp('values')}
                className="text-gray-400 hover:text-gray-600"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>

            {showHelp.values && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <p className="text-sm font-medium text-gray-800 mb-2">💡 Why This Matters:</p>
                <p className="text-sm text-gray-700 mb-3">
                  Core values aren't just words on a wall - they guide hiring, firing, and every decision. Choose 3-5 values that truly matter.
                </p>
                <p className="text-sm font-medium text-gray-800 mb-2">✨ Great values are:</p>
                <ul className="text-sm text-gray-700 list-disc list-inside mb-3 space-y-1">
                  <li>Memorable (2-3 words max)</li>
                  <li>Actionable (can be demonstrated daily)</li>
                  <li>Authentic (reflects how you really operate)</li>
                  <li>Distinctive (not generic)</li>
                </ul>
                <button
                  onClick={() => setShowValuesLibrary(true)}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Browse Values Library (35 values)
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.core_values.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleCoreValueChange(index, e.target.value)}
                    placeholder={index < 3 ? 'Recommended' : 'Optional'}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      index < 3 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300'
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4">
              {formData.core_values.filter(v => v.trim().length > 0).length >= 3 && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {formData.core_values.filter(v => v.trim().length > 0).length} values defined
                </span>
              )}
              {formData.core_values.filter(v => v.trim().length > 0).length < 3 && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Add at least 3 core values (recommended: 3-5)
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>

            <button
              onClick={() => {
                saveData();
                if (completionPercent === 100) {
                  alert('Vision, Mission & Values saved successfully!');
                } else {
                  alert('Progress saved! Complete all sections to finalize.');
                }
              }}
              className={`px-8 py-3 rounded-lg font-medium ${
                completionPercent === 100
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {completionPercent === 100 ? 'Save & Complete' : 'Save Progress'}
            </button>
          </div>
        </div>
      </div>

      {/* Values Library Modal */}
      {showValuesLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Core Values Library</h3>
                  <p className="text-sm text-gray-600 mt-1">Click any value to add it to your list</p>
                </div>
                <button
                  onClick={() => setShowValuesLibrary(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'all' ? 'All Values' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredValues.map((value, idx) => (
                  <button
                    key={idx}
                    onClick={() => addValueFromLibrary(value.name)}
                    className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                      {value.name}
                    </h4>
                    <p className="text-sm text-gray-700 italic">
                      "{value.weStatement}"
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
