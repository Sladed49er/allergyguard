// app/dashboard/meal-planner.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Users, ChefHat, Clock, AlertTriangle, CheckCircle, Edit3, Trash2, Search, Sparkles, Wand2 } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  allergies: Array<{
    name: string;
    severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  }>;
}

interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: string[];
  attendees: string[]; // Family member IDs
  notes?: string;
  prepTime?: number;
  cookTime?: number;
}

interface MealPlan {
  id: string;
  date: string;
  meals: Meal[];
}

interface MealSuggestion {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: string[];
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  description: string;
  tags: string[];
  safeFor: string[]; // Family member IDs this meal is safe for
  allergenWarnings: string[];
}

interface WeeklyPlanRequest {
  startDate: string;
  mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
  attendees: string[]; // Default family members for all meals
  dietaryPreferences: string[];
  cuisinePreferences: string[];
  cookingTime: 'quick' | 'moderate' | 'any'; // 15min, 30min, any
  budget: 'budget' | 'moderate' | 'premium';
  specialRequests: string;
}

const MealPlanner = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'week' | 'day'>('week');
  
  // AI Suggestions state
  const [showSuggestionWizard, setShowSuggestionWizard] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);

  useEffect(() => {
    loadFamilyMembers();
    loadMealPlans();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      const response = await fetch('/api/family');
      if (response.ok) {
        const data = await response.json();
        setFamilyMembers(data.familyMembers || []);
      }
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  };

  const loadMealPlans = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call to /api/meal-plans
      // For now, start with empty plans
      setMealPlans([]);
    } catch (error) {
      console.error('Error loading meal plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekDates = (startDate: string) => {
    const date = new Date(startDate);
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day.toISOString().split('T')[0]);
    }
    return week;
  };

  const getDayName = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDateNumber = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').getDate();
  };

  const getMealPlanForDate = (date: string) => {
    return mealPlans.find(plan => plan.date === date);
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return '🍳';
      case 'lunch': return '🥗';
      case 'dinner': return '🍽️';
      case 'snack': return '🍎';
      default: return '🍴';
    }
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return '#f59e0b';
      case 'lunch': return '#3b82f6';
      case 'dinner': return '#8b5cf6';
      case 'snack': return '#10b981';
      default: return '#6b7280';
    }
  };

  const checkMealSafety = (meal: Meal) => {
    const attendingMembers = familyMembers.filter(member => 
      meal.attendees.includes(member.id)
    );

    const allergens = attendingMembers.flatMap(member => 
      member.allergies.map(allergy => allergy.name.toLowerCase())
    );

    const risks = meal.ingredients.filter(ingredient => 
      allergens.some(allergen => 
        ingredient.toLowerCase().includes(allergen) || 
        allergen.includes(ingredient.toLowerCase())
      )
    );

    return {
      isSafe: risks.length === 0,
      risks,
      attendingMembers: attendingMembers.length
    };
  };

  // AI Suggestion Wizard Component
  const SuggestionWizard = () => {
    const [step, setStep] = useState(1);
    const [planRequest, setPlanRequest] = useState<WeeklyPlanRequest>({
      startDate: selectedDate,
      mealTypes: ['dinner'],
      attendees: [],
      dietaryPreferences: [],
      cuisinePreferences: [],
      cookingTime: 'moderate',
      budget: 'moderate',
      specialRequests: ''
    });

                const handleGeneratePlan = async () => {
            setIsGenerating(true);
            try {
                // Simulate AI processing time
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Generate mock suggestions based on selected preferences
                const mockSuggestions: MealSuggestion[] = [
                {
                    id: '1',
                    name: 'Grilled Chicken with Roasted Vegetables',
                    type: planRequest.mealTypes[0] || 'dinner',
                    ingredients: ['chicken breast', 'broccoli', 'carrots', 'olive oil', 'garlic', 'herbs', 'lemon'],
                    prepTime: planRequest.cookingTime === 'quick' ? 10 : 15,
                    cookTime: planRequest.cookingTime === 'quick' ? 15 : 25,
                    difficulty: 'easy',
                    cuisine: planRequest.cuisinePreferences[0] || 'American',
                    description: 'Healthy grilled chicken with seasonal roasted vegetables - perfect for the whole family',
                    tags: ['gluten-free', 'high-protein', 'family-friendly'],
                    safeFor: planRequest.attendees,
                    allergenWarnings: []
                },
                {
                    id: '2',
                    name: 'Vegetable Pasta with Marinara',
                    type: planRequest.mealTypes[0] || 'dinner',
                    ingredients: ['whole wheat pasta', 'tomato sauce', 'zucchini', 'bell peppers', 'onions', 'garlic', 'basil'],
                    prepTime: planRequest.cookingTime === 'quick' ? 5 : 10,
                    cookTime: planRequest.cookingTime === 'quick' ? 10 : 15,
                    difficulty: 'easy',
                    cuisine: 'Italian',
                    description: 'Quick and nutritious vegetable pasta that kids and adults love',
                    tags: ['vegetarian', 'quick', 'kid-friendly'],
                    safeFor: planRequest.attendees,
                    allergenWarnings: ['wheat']
                },
                {
                    id: '3',
                    name: 'Baked Salmon with Quinoa Pilaf',
                    type: planRequest.mealTypes[0] || 'dinner',
                    ingredients: ['salmon fillet', 'quinoa', 'vegetable broth', 'asparagus', 'lemon', 'dill'],
                    prepTime: 10,
                    cookTime: planRequest.cookingTime === 'quick' ? 15 : 20,
                    difficulty: 'medium',
                    cuisine: 'Mediterranean',
                    description: 'Omega-3 rich salmon with fluffy quinoa pilaf and fresh vegetables',
                    tags: ['gluten-free', 'omega-3', 'heart-healthy'],
                    safeFor: planRequest.attendees,
                    allergenWarnings: ['fish']
                },
                {
                    id: '4',
                    name: 'Turkey and Veggie Stir-Fry',
                    type: planRequest.mealTypes[0] || 'dinner',
                    ingredients: ['ground turkey', 'mixed vegetables', 'ginger', 'garlic', 'rice', 'coconut oil'],
                    prepTime: planRequest.cookingTime === 'quick' ? 5 : 10,
                    cookTime: planRequest.cookingTime === 'quick' ? 10 : 15,
                    difficulty: 'easy',
                    cuisine: 'Asian',
                    description: 'Quick and healthy stir-fry with lean turkey and colorful vegetables',
                    tags: ['gluten-free', 'dairy-free', 'quick'],
                    safeFor: planRequest.attendees,
                    allergenWarnings: []
                }
                ];

                // Filter suggestions based on cooking time if specified
                let filteredSuggestions = mockSuggestions;
                if (planRequest.cookingTime === 'quick') {
                filteredSuggestions = mockSuggestions.filter(s => (s.prepTime + s.cookTime) <= 25);
                }

                setSuggestions(filteredSuggestions);
                setStep(4); // Move to results step
            } catch (error) {
                console.error('Error generating meal plan:', error);
                alert('Error generating meal suggestions');
            } finally {
                setIsGenerating(false);
            }
            };

    const addSuggestionToMealPlan = (suggestion: MealSuggestion) => {
      const meal: Meal = {
        id: Date.now().toString(),
        name: suggestion.name,
        type: suggestion.type,
        ingredients: suggestion.ingredients,
        attendees: suggestion.safeFor,
        prepTime: suggestion.prepTime,
        cookTime: suggestion.cookTime,
        notes: suggestion.description
      };

      // Find or create meal plan for selected date
      let planForDate = getMealPlanForDate(selectedDate);
      if (!planForDate) {
        planForDate = {
          id: Date.now().toString(),
          date: selectedDate,
          meals: []
        };
      }

      planForDate.meals.push(meal);

      // Update meal plans state
      setMealPlans(prev => {
        const updated = prev.filter(plan => plan.date !== selectedDate);
        return [...updated, planForDate!];
      });

      alert(`✅ ${suggestion.name} added to your meal plan!`);
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: '0' }}>
                  🤖 AI Meal Planner
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                  Let AI create personalized, family-safe meal suggestions
                </p>
              </div>
              <button 
                onClick={() => setShowSuggestionWizard(false)}
                style={{
                  padding: '0.5rem',
                  background: 'rgba(107, 114, 128, 0.1)',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                {['Meals', 'Family', 'Preferences', 'Results'].map((label, index) => (
                  <span key={index} style={{
                    fontSize: '0.8rem',
                    color: step > index + 1 ? '#22c55e' : step === index + 1 ? '#3b82f6' : '#9ca3af',
                    fontWeight: step === index + 1 ? '600' : '400'
                  }}>
                    {label}
                  </span>
                ))}
              </div>
              <div style={{
                width: '100%',
                height: '4px',
                background: '#e5e7eb',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(step / 4) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Step 1: Meal Types */}
            {step === 1 && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>
                  📅 What meals would you like suggestions for?
                </h3>
                
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.75rem' }}>
                    Which meals? (Select all that apply)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {[
                      { type: 'breakfast', icon: '🍳', label: 'Breakfast' },
                      { type: 'lunch', icon: '🥗', label: 'Lunch' },
                      { type: 'dinner', icon: '🍽️', label: 'Dinner' },
                      { type: 'snack', icon: '🍎', label: 'Snacks' }
                    ].map(meal => (
                      <div key={meal.type} style={{
                        padding: '1rem',
                        background: planRequest.mealTypes.includes(meal.type as any) ? 'rgba(34, 197, 94, 0.1)' : '#f9fafb',
                        border: `2px solid ${planRequest.mealTypes.includes(meal.type as any) ? '#22c55e' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }} onClick={() => {
                        setPlanRequest(prev => ({
                          ...prev,
                          mealTypes: prev.mealTypes.includes(meal.type as any)
                            ? prev.mealTypes.filter(t => t !== meal.type)
                            : [...prev.mealTypes, meal.type as any]
                        }));
                      }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{meal.icon}</div>
                        <div style={{ fontWeight: '500', color: '#374151' }}>{meal.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.75rem' }}>
                    How much time do you have for cooking?
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[
                      { value: 'quick', label: '⚡ Quick (15 min)', desc: 'Fast & simple meals' },
                      { value: 'moderate', label: '🕐 Moderate (30 min)', desc: 'Balanced prep time' },
                      { value: 'any', label: '👨‍🍳 Any time', desc: 'No time restrictions' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setPlanRequest(prev => ({ ...prev, cookingTime: option.value as any }))}
                        style={{
                          flex: 1,
                          padding: '1rem',
                          background: planRequest.cookingTime === option.value ? 'rgba(34, 197, 94, 0.1)' : '#f9fafb',
                          border: `2px solid ${planRequest.cookingTime === option.value ? '#22c55e' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                          {option.label}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {option.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Family Selection */}
            {step === 2 && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>
                  👨‍👩‍👧‍👦 Who's eating? (Default attendees)
                </h3>
                
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  Select family members who will typically be eating these meals.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {familyMembers.map(member => (
                    <div key={member.id} style={{
                      padding: '1rem',
                      background: planRequest.attendees.includes(member.id) ? 'rgba(34, 197, 94, 0.1)' : '#f9fafb',
                      border: `2px solid ${planRequest.attendees.includes(member.id) ? '#22c55e' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }} onClick={() => {
                      setPlanRequest(prev => ({
                        ...prev,
                        attendees: prev.attendees.includes(member.id)
                          ? prev.attendees.filter(id => id !== member.id)
                          : [...prev.attendees, member.id]
                      }));
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={planRequest.attendees.includes(member.id)}
                          onChange={() => {}}
                          style={{ pointerEvents: 'none' }}
                        />
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>{member.name}</span>
                      </div>
                      
                      {member.allergies && member.allergies.length > 0 && (
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          🚨 Allergies: {member.allergies.map(a => a.name).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {planRequest.attendees.length === 0 && (
                  <div style={{
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: '#d97706', margin: '0', fontSize: '0.9rem' }}>
                      ⚠️ Please select at least one family member to continue
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Preferences */}
            {step === 3 && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>
                  🍽️ Your Preferences
                </h3>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.75rem' }}>
                    Favorite Cuisines (Optional)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {['Italian', 'Mexican', 'Asian', 'American', 'Mediterranean', 'Indian', 'Thai', 'French'].map(cuisine => (
                      <button
                        key={cuisine}
                        onClick={() => {
                          setPlanRequest(prev => ({
                            ...prev,
                            cuisinePreferences: prev.cuisinePreferences.includes(cuisine)
                              ? prev.cuisinePreferences.filter(c => c !== cuisine)
                              : [...prev.cuisinePreferences, cuisine]
                          }));
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: planRequest.cuisinePreferences.includes(cuisine) ? 'rgba(34, 197, 94, 0.1)' : '#f9fafb',
                          border: `1px solid ${planRequest.cuisinePreferences.includes(cuisine) ? '#22c55e' : '#d1d5db'}`,
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.75rem' }}>
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={planRequest.specialRequests}
                    onChange={(e) => setPlanRequest(prev => ({ ...prev, specialRequests: e.target.value }))}
                    placeholder="e.g., 'More breakfast options', 'Easy meals for busy weeknights', 'Include vegetarian dinner'..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Results */}
            {step === 4 && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>
                  🎉 Your AI-Generated Meal Suggestions
                </h3>
                
                {isGenerating ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      border: '4px solid #e5e7eb',
                      borderTop: '4px solid #22c55e',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 1rem'
                    }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      🤖 AI is creating your personalized meal suggestions...
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                      Analyzing family allergies and generating safe meal options
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      marginBottom: '2rem',
                      textAlign: 'center'
                    }}>
                      <h4 style={{ color: '#059669', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                        ✨ Your meal suggestions are ready!
                      </h4>
                      <p style={{ color: '#059669', margin: '0', fontSize: '0.9rem' }}>
                        {suggestions.length} family-safe meals generated based on your preferences
                      </p>
                    </div>

                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {suggestions.map((suggestion, index) => (
                        <div key={suggestion.id} style={{
                          background: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '1rem',
                          marginBottom: '0.75rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ flex: 1 }}>
                            <h5 style={{ margin: '0 0 0.25rem 0', color: '#1f2937', fontSize: '1rem' }}>
                              {getMealIcon(suggestion.type)} {suggestion.name}
                            </h5>
                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: '#6b7280' }}>
                              {suggestion.description}
                            </p>
                            <p style={{ margin: '0', fontSize: '0.75rem', color: '#9ca3af' }}>
                              ⏱️ {suggestion.prepTime + suggestion.cookTime} min total • {suggestion.cuisine}
                              {suggestion.allergenWarnings.length > 0 && (
                                <span style={{ color: '#dc2626', marginLeft: '0.5rem' }}>
                                  ⚠️ Contains: {suggestion.allergenWarnings.join(', ')}
                                </span>
                              )}
                            </p>
                          </div>
                          <button 
                            onClick={() => addSuggestionToMealPlan(suggestion)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              marginLeft: '1rem'
                            }}
                          >
                            Add to Plan
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button
                onClick={() => step > 1 ? setStep(step - 1) : setShowSuggestionWizard(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(107, 114, 128, 0.1)',
                  color: '#374151',
                  border: '1px solid rgba(107, 114, 128, 0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>

              {step < 3 && (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && planRequest.mealTypes.length === 0) ||
                    (step === 2 && planRequest.attendees.length === 0)
                  }
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    opacity: (
                      (step === 1 && planRequest.mealTypes.length === 0) ||
                      (step === 2 && planRequest.attendees.length === 0)
                    ) ? 0.5 : 1
                  }}
                >
                  Continue
                </button>
              )}

              {step === 3 && (
                <button
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: isGenerating ? '#9ca3af' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isGenerating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isGenerating ? 'Generating...' : '🤖 Generate AI Suggestions'}
                </button>
              )}

              {step === 4 && !isGenerating && (
                <button
                  onClick={() => setShowSuggestionWizard(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AddMealForm = () => {
    const [name, setName] = useState(editingMeal?.name || '');
    const [type, setType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(editingMeal?.type || 'dinner');
    const [ingredients, setIngredients] = useState(editingMeal?.ingredients.join(', ') || '');
    const [attendees, setAttendees] = useState<string[]>(editingMeal?.attendees || []);
    const [notes, setNotes] = useState(editingMeal?.notes || '');
    const [prepTime, setPrepTime] = useState(editingMeal?.prepTime?.toString() || '');
    const [cookTime, setCookTime] = useState(editingMeal?.cookTime?.toString() || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleMemberToggle = (memberId: string) => {
      setAttendees(prev => 
        prev.includes(memberId) 
          ? prev.filter(id => id !== memberId)
          : [...prev, memberId]
      );
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const mealData: Meal = {
          id: editingMeal?.id || Date.now().toString(),
          name,
          type,
          ingredients: ingredients.split(',').map(i => i.trim()).filter(i => i),
          attendees,
          notes: notes || undefined,
          prepTime: prepTime ? parseInt(prepTime) : undefined,
          cookTime: cookTime ? parseInt(cookTime) : undefined
        };

        // Find or create meal plan for selected date
        let planForDate = getMealPlanForDate(selectedDate);
        if (!planForDate) {
          planForDate = {
            id: Date.now().toString(),
            date: selectedDate,
            meals: []
          };
        }

        if (editingMeal) {
          // Update existing meal
          planForDate.meals = planForDate.meals.map(meal => 
            meal.id === editingMeal.id ? mealData : meal
          );
        } else {
          // Add new meal
          planForDate.meals.push(mealData);
        }

        // Update meal plans state
        setMealPlans(prev => {
          const updated = prev.filter(plan => plan.date !== selectedDate);
          return [...updated, planForDate!];
        });

        setShowAddMeal(false);
        setEditingMeal(null);
        resetForm();
      } catch (error) {
        console.error('Error saving meal:', error);
        alert('Failed to save meal');
      } finally {
        setIsSubmitting(false);
      }
    };

    const resetForm = () => {
      setName('');
      setType('dinner');
      setIngredients('');
      setAttendees([]);
      setNotes('');
      setPrepTime('');
      setCookTime('');
    };

    const getAttendingAllergies = () => {
      const attendingMembers = familyMembers.filter(member => attendees.includes(member.id));
      const allergies = attendingMembers.flatMap(member => member.allergies);
      return allergies;
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                {editingMeal ? 'Edit Meal' : 'Plan New Meal'}
              </h3>
              <button 
                onClick={() => {
                  setShowAddMeal(false);
                  setEditingMeal(null);
                }}
                style={{
                  padding: '0.5rem',
                  background: 'rgba(107, 114, 128, 0.1)',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Meal Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#f9fafb',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      color: '#1f2937',
                      fontSize: '0.9rem'
                    }}
                    placeholder="e.g., Spaghetti Bolognese"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Meal Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#f9fafb',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      color: '#1f2937',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="breakfast">🍳 Breakfast</option>
                    <option value="lunch">🥗 Lunch</option>
                    <option value="dinner">🍽️ Dinner</option>
                    <option value="snack">🍎 Snack</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Who's Eating? *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  {familyMembers.map(member => (
                    <div key={member.id} style={{
                      padding: '0.75rem',
                      background: attendees.includes(member.id) ? 'rgba(34, 197, 94, 0.1)' : '#f9fafb',
                      border: `2px solid ${attendees.includes(member.id) ? '#22c55e' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }} onClick={() => handleMemberToggle(member.id)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={attendees.includes(member.id)}
                          onChange={() => handleMemberToggle(member.id)}
                          style={{ pointerEvents: 'none' }}
                        />
                        <span style={{ fontWeight: '500', color: '#374151' }}>
                          {member.name}
                        </span>
                      </div>
                      {member.allergies.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          Allergies: {member.allergies.map(a => a.name).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {attendees.length > 0 && getAttendingAllergies().length > 0 && (
                <div style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginBottom: '1.5rem'
                }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: '#d97706', margin: '0 0 0.5rem 0' }}>
                    ⚠️ Watch Out For These Allergies:
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: '#d97706' }}>
                    {getAttendingAllergies().map((allergy, index) => (
                      <span key={index} style={{
                        display: 'inline-block',
                        background: 'rgba(251, 191, 36, 0.2)',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '12px',
                        margin: '0.125rem',
                        fontSize: '0.75rem'
                      }}>
                        {allergy.name} ({allergy.severity.replace('_', ' ').toLowerCase()})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Ingredients *
                </label>
                <textarea
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#f9fafb',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    color: '#1f2937',
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                  placeholder="List ingredients separated by commas (e.g., ground beef, tomatoes, onions, garlic, pasta)"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Prep Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#f9fafb',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      color: '#1f2937',
                      fontSize: '0.9rem'
                    }}
                    placeholder="15"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Cook Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#f9fafb',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      color: '#1f2937',
                      fontSize: '0.9rem'
                    }}
                    placeholder="30"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#f9fafb',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    color: '#1f2937',
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                  placeholder="Special instructions, substitutions, etc."
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !name.trim() || !ingredients.trim() || attendees.length === 0}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: (isSubmitting || !name.trim() || !ingredients.trim() || attendees.length === 0) ? '#9ca3af' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: (isSubmitting || !name.trim() || !ingredients.trim() || attendees.length === 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Saving...' : editingMeal ? 'Update Meal' : 'Add to Meal Plan'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const MealCard = ({ meal, date }: { meal: Meal, date: string }) => {
    const safety = checkMealSafety(meal);
    const attendingMembers = familyMembers.filter(member => meal.attendees.includes(member.id));

    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        border: `2px solid ${safety.isSafe ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '0.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{getMealIcon(meal.type)}</span>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                {meal.name}
              </h4>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' }}>
                {meal.type} • {attendingMembers.length} person{attendingMembers.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {safety.isSafe ? (
              <CheckCircle size={16} style={{ color: '#059669' }} />
            ) : (
              <AlertTriangle size={16} style={{ color: '#dc2626' }} />
            )}
            <button
              onClick={() => {
                setEditingMeal(meal);
                setShowAddMeal(true);
              }}
              style={{
                padding: '0.25rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              <Edit3 size={14} />
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          <strong>Eating:</strong> {attendingMembers.map(m => m.name).join(', ')}
        </div>

        {!safety.isSafe && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            padding: '0.5rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            ⚠️ Potential allergen risk: {safety.risks.join(', ')}
          </div>
        )}

        {(meal.prepTime || meal.cookTime) && (
          <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', gap: '1rem' }}>
            {meal.prepTime && <span>⏱️ Prep: {meal.prepTime}m</span>}
            {meal.cookTime && <span>🔥 Cook: {meal.cookTime}m</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0' }}>
            Plan family-safe meals with smart allergen checking 🍽️
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '8px',
            padding: '0.25rem'
          }}>
            <button
              onClick={() => setActiveView('week')}
              style={{
                padding: '0.5rem 1rem',
                background: activeView === 'week' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'transparent',
                color: activeView === 'week' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Week View
            </button>
            <button
              onClick={() => setActiveView('day')}
              style={{
                padding: '0.5rem 1rem',
                background: activeView === 'day' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'transparent',
                color: activeView === 'day' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Day View
            </button>
          </div>
          
          <button
            onClick={() => setShowSuggestionWizard(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)'
            }}
          >
            <Wand2 size={18} />
            AI Suggestions
          </button>
          
          <button
            onClick={() => setShowAddMeal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <Plus size={18} />
            Plan Meal
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.6)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <button
          onClick={() => {
            const date = new Date(selectedDate);
            date.setDate(date.getDate() - (activeView === 'week' ? 7 : 1));
            setSelectedDate(date.toISOString().split('T')[0]);
          }}
          style={{
            padding: '0.5rem',
            background: 'rgba(107, 114, 128, 0.1)',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          ‹
        </button>
        
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: 'white'
          }}
        />
        
        <button
          onClick={() => {
            const date = new Date(selectedDate);
            date.setDate(date.getDate() + (activeView === 'week' ? 7 : 1));
            setSelectedDate(date.toISOString().split('T')[0]);
          }}
          style={{
            padding: '0.5rem',
            background: 'rgba(107, 114, 128, 0.1)',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          ›
        </button>
      </div>

      {/* Meal Plan Display */}
      {activeView === 'week' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {getWeekDates(selectedDate).map(date => {
            const dayPlan = getMealPlanForDate(date);
            const isToday = date === new Date().toISOString().split('T')[0];
            
            return (
              <div key={date} style={{
                background: isToday ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255, 255, 255, 0.4)',
                border: `1px solid ${isToday ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.6)'}`,
                borderRadius: '16px',
                padding: '1.25rem',
                minHeight: '300px'
              }}>
                <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {getDayName(date)}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
                    {getDateNumber(date)}
                  </div>
                  {isToday && (
                    <div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: '500' }}>
                      Today
                    </div>
                  )}
                </div>

                {dayPlan?.meals.length ? (
                  dayPlan.meals.map(meal => (
                    <MealCard key={meal.id} meal={meal} date={date} />
                  ))
                ) : (
                  <div style={{
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '0.85rem',
                    marginTop: '2rem'
                  }}>
                    <ChefHat size={24} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                    <p>No meals planned</p>
                    <button
                      onClick={() => {
                        setSelectedDate(date);
                        setShowAddMeal(true);
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(34, 197, 94, 0.1)',
                        color: '#22c55e',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      Add Meal
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Day View
        <div style={{
          background: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '16px',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem', textAlign: 'center' }}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>

          {(() => {
            const dayPlan = getMealPlanForDate(selectedDate);
            const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
            
            return mealTypes.map(type => {
              const mealsOfType = dayPlan?.meals.filter(meal => meal.type === type) || [];
              
              return (
                <div key={type} style={{ marginBottom: '2rem' }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: getMealTypeColor(type),
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>{getMealIcon(type)}</span>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </h4>
                  
                  {mealsOfType.length > 0 ? (
                    mealsOfType.map(meal => (
                      <MealCard key={meal.id} meal={meal} date={selectedDate} />
                    ))
                  ) : (
                    <div style={{
                      border: '2px dashed #d1d5db',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      textAlign: 'center',
                      color: '#9ca3af'
                    }}>
                      <p style={{ margin: '0 0 0.75rem 0' }}>No {type} planned</p>
                      <button
                        onClick={() => setShowAddMeal(true)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'rgba(34, 197, 94, 0.1)',
                          color: '#22c55e',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        Add {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}

      {showAddMeal && <AddMealForm />}
      {showSuggestionWizard && <SuggestionWizard />}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export { MealPlanner };