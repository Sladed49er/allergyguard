// app/dashboard/meal-planner.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Users, ChefHat, Clock, AlertTriangle, CheckCircle, Edit3, Trash2, Search } from 'lucide-react';

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

const MealPlanner = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'week' | 'day'>('week');

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

        // TODO: Save to API
        // await fetch('/api/meal-plans', { method: 'POST', body: JSON.stringify(planForDate) });

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
                        {allergy.name} ({allergy.severity})
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
    </div>
  );
};

export { MealPlanner };
export default MealPlanner;