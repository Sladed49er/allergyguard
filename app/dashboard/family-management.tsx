// app/dashboard/family-management.tsx
'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Edit3, Trash2, AlertTriangle, Heart, Baby, User, Crown } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  age?: number;
  role: 'parent' | 'child' | 'other';
  allergies: Allergy[];
  avatar?: string;
}

interface Allergy {
  id: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  symptoms?: string;
  notes?: string;
}

export const FamilyManagement = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Common allergens list
  const commonAllergens = [
    'Milk', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 'Peanuts', 
    'Wheat', 'Soybeans', 'Sesame', 'Corn', 'Beef', 'Chicken',
    'Pork', 'Lamb', 'Rice', 'Oats', 'Barley', 'Tomatoes',
    'Strawberries', 'Citrus', 'Chocolate', 'Food Dyes', 'Sulfites'
  ];

  // Load family members (placeholder - will connect to API)
  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/family');
      if (response.ok) {
        const data = await response.json();
        setFamilyMembers(data.familyMembers || []);
      } else {
        console.error('Failed to load family members');
      }
    } catch (error) {
      console.error('Failed to load family members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setShowAddMember(true); // Reuse the same modal
  };

  const handleUpdateMember = async (memberData: any) => {
    try {
      const response = await fetch('/api/family', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      });

      if (response.ok) {
        const data = await response.json();
        setFamilyMembers(data.familyMembers);
        setEditingMember(null);
        setShowAddMember(false);
        alert('✅ Family member updated successfully!');
      } else {
        const errorData = await response.json();
        alert('❌ Failed to update family member: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating family member:', error);
      alert('❌ Failed to update family member. Please try again.');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this family member?')) {
      return;
    }

    try {
      const response = await fetch(`/api/family?id=${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setFamilyMembers(data.familyMembers);
        alert('✅ Family member removed successfully!');
      } else {
        const errorData = await response.json();
        alert('❌ Failed to remove family member: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error removing family member:', error);
      alert('❌ Failed to remove family member. Please try again.');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'parent': return Crown;
      case 'child': return Baby;
      default: return User;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return '#22c55e';
      case 'moderate': return '#f59e0b';
      case 'severe': return '#f97316';
      case 'life-threatening': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const AddMemberForm = () => {
    const [name, setName] = useState(editingMember?.name || '');
    const [age, setAge] = useState(editingMember?.age?.toString() || '');
    const [role, setRole] = useState<'parent' | 'child' | 'other'>(editingMember?.role || 'child');
    const [allergyData, setAllergyData] = useState<{[key: string]: {selected: boolean, severity: string}}>(
      () => {
        const initial: {[key: string]: {selected: boolean, severity: string}} = {};
        commonAllergens.forEach(allergen => {
          const existingAllergy = editingMember?.allergies.find(a => a.allergen === allergen);
          initial[allergen] = {
            selected: !!existingAllergy,
            severity: existingAllergy?.severity || 'moderate'
          };
        });
        return initial;
      }
    );
    const [customAllergen, setCustomAllergen] = useState('');
    const [customAllergies, setCustomAllergies] = useState<{[key: string]: {selected: boolean, severity: string}}>(
      () => {
        const custom: {[key: string]: {selected: boolean, severity: string}} = {};
        editingMember?.allergies.forEach(allergy => {
          if (!commonAllergens.includes(allergy.allergen)) {
            custom[allergy.allergen] = {
              selected: true,
              severity: allergy.severity
            };
          }
        });
        return custom;
      }
    );

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      
      try {
        // Collect all selected allergies with their severity levels
        const selectedAllergies: any[] = [];
        
        // Add common allergies
        Object.entries(allergyData).forEach(([allergen, data]) => {
          if (data.selected) {
            selectedAllergies.push({
              allergen,
              severity: data.severity
            });
          }
        });
        
        // Add custom allergies
        Object.entries(customAllergies).forEach(([allergen, data]) => {
          if (data.selected) {
            selectedAllergies.push({
              allergen,
              severity: data.severity
            });
          }
        });

        const memberData = {
          ...(editingMember && { id: editingMember.id }),
          name,
          age: age ? parseInt(age) : undefined,
          role,
          allergies: selectedAllergies
        };

        if (editingMember) {
          await handleUpdateMember(memberData);
        } else {
          const response = await fetch('/api/family', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(memberData),
          });

          if (response.ok) {
            const data = await response.json();
            setFamilyMembers(data.familyMembers);
            setShowAddMember(false);
            alert('✅ Family member added successfully!');
          } else {
            const errorData = await response.json();
            alert('❌ Failed to add family member: ' + (errorData.error || 'Unknown error'));
          }
        }
        
        // Reset form
        setName('');
        setAge('');
        setRole('child');
        setAllergyData({});
        setCustomAllergen('');
        setCustomAllergies({});
        
      } catch (error) {
        console.error('Error saving family member:', error);
        alert('❌ Failed to save family member. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const toggleAllergy = (allergen: string, isCustom: boolean = false) => {
      if (isCustom) {
        setCustomAllergies(prev => ({
          ...prev,
          [allergen]: {
            selected: !prev[allergen]?.selected,
            severity: prev[allergen]?.severity || 'moderate'
          }
        }));
      } else {
        setAllergyData(prev => ({
          ...prev,
          [allergen]: {
            selected: !prev[allergen]?.selected,
            severity: prev[allergen]?.severity || 'moderate'
          }
        }));
      }
    };

    const updateSeverity = (allergen: string, severity: string, isCustom: boolean = false) => {
      if (isCustom) {
        setCustomAllergies(prev => ({
          ...prev,
          [allergen]: {
            ...prev[allergen],
            severity
          }
        }));
      } else {
        setAllergyData(prev => ({
          ...prev,
          [allergen]: {
            ...prev[allergen],
            severity
          }
        }));
      }
    };

    const addCustomAllergy = () => {
      if (customAllergen.trim() && !customAllergies[customAllergen.trim()]) {
        setCustomAllergies(prev => ({
          ...prev,
          [customAllergen.trim()]: {
            selected: true,
            severity: 'moderate'
          }
        }));
        setCustomAllergen('');
      }
    };

    const removeCustomAllergy = (allergen: string) => {
      setCustomAllergies(prev => {
        const newCustom = { ...prev };
        delete newCustom[allergen];
        return newCustom;
      });
    };

    return (
      <div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#ffffff',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                color: '#1f2937',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Age (optional)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age"
                min="0"
                max="120"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#ffffff',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  color: '#1f2937',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#ffffff',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  color: '#1f2937',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Known Allergies
            </label>
            
            {/* Common Allergies */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              {commonAllergens.map(allergen => (
                <div key={allergen} style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '0.75rem',
                  backgroundColor: allergyData[allergen]?.selected ? '#f0fdf4' : '#f9fafb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={allergyData[allergen]?.selected || false}
                      onChange={() => toggleAllergy(allergen)}
                      style={{ marginRight: '0.25rem' }}
                    />
                    <span style={{ fontWeight: '500', fontSize: '0.85rem' }}>{allergen}</span>
                  </div>
                  
                  {allergyData[allergen]?.selected && (
                    <select
                      value={allergyData[allergen]?.severity || 'moderate'}
                      onChange={(e) => updateSeverity(allergen, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.25rem',
                        fontSize: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                      <option value="life-threatening">Life Threatening</option>
                    </select>
                  )}
                </div>
              ))}
            </div>

            {/* Custom Allergies */}
            {Object.keys(customAllergies).length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Custom Allergies:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {Object.entries(customAllergies).map(([allergen, data]) => (
                    <div key={allergen} style={{ 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px', 
                      padding: '0.75rem',
                      backgroundColor: '#fef3c7'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '500', fontSize: '0.85rem', flex: 1 }}>{allergen}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomAllergy(allergen)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            padding: '0.125rem'
                          }}
                        >
                          ×
                        </button>
                      </div>
                      
                      <select
                        value={data.severity}
                        onChange={(e) => updateSeverity(allergen, e.target.value, true)}
                        style={{
                          width: '100%',
                          padding: '0.25rem',
                          fontSize: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                        <option value="life-threatening">Life Threatening</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add Custom Allergy */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={customAllergen}
                onChange={(e) => setCustomAllergen(e.target.value)}
                placeholder="Add custom allergy..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAllergy())}
                style={{
                  flex: '1',
                  padding: '0.75rem',
                  backgroundColor: '#ffffff',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  color: '#1f2937',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
              <button 
                type="button" 
                onClick={addCustomAllergy}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: '500'
                }}
              >
                Add
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem'
            }}
          >
            {isLoading ? 'Saving...' : (editingMember ? 'Update Family Member' : 'Add Family Member')}
          </button>
        </form>
      </div>
    );
  };

  const MemberCard = ({ member }: { member: FamilyMember }) => {
    const RoleIcon = getRoleIcon(member.role);
    
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.9)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <RoleIcon size={24} />
            </div>
            <div>
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 0.25rem 0'
              }}>
                {member.name}
              </h4>
              <span style={{
                fontSize: '0.85rem',
                color: '#6b7280',
                textTransform: 'capitalize'
              }}>
                {member.age && `${member.age} years old • `}
                {member.role}
              </span>
            </div>
          </div>
          
          <button 
            style={{
              padding: '0.5rem',
              background: 'rgba(107, 114, 128, 0.1)',
              color: '#6b7280',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleEditMember(member)}
          >
            <Edit3 size={16} />
          </button>
        </div>

        <div>
          <h5 style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 0.75rem 0'
          }}>
            Allergies ({member.allergies.length})
          </h5>
          {member.allergies.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {member.allergies.map(allergy => (
                <div 
                  key={allergy.id} 
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${getSeverityColor(allergy.severity)}`
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{ fontWeight: '500', color: '#1f2937' }}>
                      {allergy.allergen}
                    </span>
                    <span 
                      style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: 'white',
                        textTransform: 'capitalize',
                        backgroundColor: getSeverityColor(allergy.severity)
                      }}
                    >
                      {allergy.severity}
                    </span>
                  </div>
                  {allergy.symptoms && (
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#6b7280',
                      marginTop: '0.25rem'
                    }}>
                      Symptoms: {allergy.symptoms}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem',
              background: 'rgba(34, 197, 94, 0.05)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '8px',
              color: '#059669',
              fontSize: '0.9rem'
            }}>
              <Heart size={20} style={{ color: '#22c55e' }} />
              <span>No known allergies</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '2rem', 
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <Users size={22} />
          <div>
            <h2 style={{ 
              fontSize: '1.4rem', 
              fontWeight: '600', 
              color: '#1f2937', 
              margin: '0 0 0.25rem 0' 
            }}>
              Family Management
            </h2>
            <p style={{ color: '#6b7280', margin: '0', fontSize: '0.9rem' }}>
              Manage your family members and their allergies
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowAddMember(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Plus size={18} />
          Add Member
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #22c55e',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Loading family members...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {familyMembers.map(member => (
            <MemberCard key={member.id} member={member} />
          ))}
          
          {familyMembers.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem 2rem',
              color: '#6b7280'
            }}>
              <Users size={48} />
              <h3 style={{
                fontSize: '1.2rem',
                color: '#1f2937',
                margin: '1rem 0 0.5rem 0'
              }}>
                No family members added yet
              </h3>
              <p>Add family members to track their specific allergies</p>
              <button 
                onClick={() => setShowAddMember(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  margin: '1rem auto 0',
                  transition: 'all 0.2s ease'
                }}
              >
                <Plus size={18} />
                Add Your First Family Member
              </button>
            </div>
          )}
        </div>
      )}

      {showAddMember && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div 
            className="modal-content"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              border: '2px solid #e5e7eb'
            }}
          >
            <div 
              style={{
                padding: '2rem',
                color: '#1f2937',
                backgroundColor: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                  {editingMember ? 'Edit Family Member' : 'Add Family Member'}
                </h3>
                <button 
                  onClick={() => {
                    setShowAddMember(false);
                    setEditingMember(null);
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    color: '#6b7280',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ×
                </button>
              </div>
              <AddMemberForm />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .family-management {
          max-width: 100%;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .header-content {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .header-content h2 {
          font-size: 1.4rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
        }

        .header-content p {
          color: #6b7280;
          margin: 0;
          font-size: 0.9rem;
        }

        .add-member-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .add-member-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .organic-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #22c55e;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .member-card {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .member-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .member-info {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .member-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .member-info h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
        }

        .member-details {
          font-size: 0.85rem;
          color: #6b7280;
          text-transform: capitalize;
        }

        .edit-btn {
          padding: 0.5rem;
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-btn:hover {
          background: rgba(107, 114, 128, 0.2);
          color: #374151;
        }

        .allergies-section h5 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.75rem 0;
        }

        .allergies-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .allergy-item {
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 8px;
          border-left-width: 4px;
        }

        .allergy-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .allergy-name {
          font-weight: 500;
          color: #1f2937;
        }

        .severity-badge {
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
          text-transform: capitalize;
        }

        .allergy-symptoms {
          font-size: 0.8rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .no-allergies {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(34, 197, 94, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 8px;
          color: #059669;
          font-size: 0.9rem;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem 2rem;
          color: #6b7280;
        }

        .empty-state h3 {
          font-size: 1.2rem;
          color: #1f2937;
          margin: 1rem 0 0.5rem 0;
        }

        .add-first-member-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          margin: 1rem auto 0;
          transition: all 0.2s ease;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: #ffffff;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .add-member-form {
          padding: 2rem;
          color: #1f2937;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .form-header h3 {
          font-size: 1.3rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .close-button {
          width: 32px;
          height: 32px;
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #6b7280;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: rgba(107, 114, 128, 0.1);
          color: #374151;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem;
          background: #f9fafb;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          color: #1f2937;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        .allergy-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .allergy-chip {
          padding: 0.5rem 0.75rem;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 20px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          font-weight: 500;
        }

        .allergy-chip:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        .allergy-chip.selected {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          border-color: #22c55e;
        }

        .custom-allergy {
          display: flex;
          gap: 0.5rem;
        }

        .add-custom-btn {
          padding: 0.75rem 1rem;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          font-weight: 500;
        }

        .add-custom-btn:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        .save-btn {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .section-header {
            flex-direction: column;
            align-items: stretch;
          }

          .add-member-btn {
            align-self: flex-start;
          }

          .members-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .allergy-grid {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

// Also add default export for compatibility
export default FamilyManagement;