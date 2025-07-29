// app/dashboard/family-management.tsx
'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Edit3, Trash2, AlertTriangle, Heart, Baby, User, Crown } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  age?: number;
  role: 'parent' | 'child' | 'other';
  allergies: Array<{
    name: string;
    severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
    notes?: string;
  }>;
}

const commonAllergens = [
  'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish',
  'Sesame', 'Corn', 'Coconut', 'Mustard', 'Sulfites', 'Celery', 'Lupin'
];

export const FamilyManagement = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      console.error('Error loading family members:', error);
    } finally {
      setIsLoading(false);
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
    switch (severity.toLowerCase()) {
      case 'mild': return '#22c55e';
      case 'moderate': return '#f59e0b';
      case 'severe': return '#f97316';
      case 'life_threatening':
      case 'life-threatening': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setShowAddMember(true);
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this family member?')) {
      return;
    }

    try {
      const response = await fetch(`/api/family?id=${memberId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadFamilyMembers(); // Reload the list
      } else {
        alert('Failed to delete family member');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Error deleting family member');
    }
  };

  const AddMemberForm = () => {
    const [name, setName] = useState(editingMember?.name || '');
    const [age, setAge] = useState(editingMember?.age?.toString() || '');
    const [role, setRole] = useState<'parent' | 'child' | 'other'>(editingMember?.role || 'parent');
    const [allergyData, setAllergyData] = useState<{[key: string]: {selected: boolean, severity: string}}>(() => {
      const initial: {[key: string]: {selected: boolean, severity: string}} = {};
      commonAllergens.forEach(allergen => {
        const existingAllergy = editingMember?.allergies.find(a => a.name === allergen);
        initial[allergen] = {
          selected: !!existingAllergy,
          severity: existingAllergy?.severity || 'moderate'
        };
      });
      return initial;
    });
    const [customAllergies, setCustomAllergies] = useState<{[key: string]: {severity: string}}>(
      () => {
        const custom: {[key: string]: {severity: string}} = {};
        editingMember?.allergies.forEach(allergy => {
          if (!commonAllergens.includes(allergy.name)) {
            custom[allergy.name] = { severity: allergy.severity };
          }
        });
        return custom;
      }
    );
    const [customAllergen, setCustomAllergen] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateSeverity = (allergen: string, severity: string, isCustom = false) => {
      if (isCustom) {
        setCustomAllergies(prev => ({
          ...prev,
          [allergen]: { severity }
        }));
      } else {
        setAllergyData(prev => ({
          ...prev,
          [allergen]: { ...prev[allergen], severity }
        }));
      }
    };

    const addCustomAllergy = () => {
      if (customAllergen.trim()) {
        setCustomAllergies(prev => ({
          ...prev,
          [customAllergen.trim()]: { severity: 'moderate' }
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

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const selectedAllergies = [
          ...Object.entries(allergyData)
            .filter(([_, data]) => data.selected)
            .map(([allergen, data]) => ({
              name: allergen,
              severity: data.severity === 'life-threatening' ? 'life_threatening' : data.severity
            })),
          ...Object.entries(customAllergies).map(([allergen, data]) => ({
            name: allergen,
            severity: data.severity === 'life-threatening' ? 'life_threatening' : data.severity
          }))
        ];

        const memberData: any = {
          name,
          age: age ? parseInt(age) : undefined,
          role,
          allergies: selectedAllergies
        };

        const url = editingMember ? '/api/family' : '/api/family';
        const method = editingMember ? 'PUT' : 'POST';

        if (editingMember) {
          memberData.id = editingMember.id;
        }

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberData)
        });

        if (response.ok) {
          await loadFamilyMembers();
          setShowAddMember(false);
          setEditingMember(null);
          // Reset form
          setName('');
          setAge('');
          setRole('parent');
          setAllergyData(() => {
            const initial: {[key: string]: {selected: boolean, severity: string}} = {};
            commonAllergens.forEach(allergen => {
              initial[allergen] = { selected: false, severity: 'moderate' };
            });
            return initial;
          });
          setCustomAllergies({});
          setCustomAllergen('');
        } else {
          alert('Failed to save family member');
        }
      } catch (error) {
        console.error('Error saving member:', error);
        alert('Error saving family member');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div 
        style={{
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
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAddMember(false);
            setEditingMember(null);
          }
        }}
      >
        <div 
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.9)'
          }}
        >
          <div style={{ padding: '1.5rem' }}>
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
                  padding: '0.5rem',
                  background: 'rgba(107, 114, 128, 0.1)',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Name *
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
                    fontSize: '0.9rem',
                    transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  placeholder="Enter family member's name"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#f9fafb',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      color: '#1f2937',
                      fontSize: '0.9rem'
                    }}
                    placeholder="Age"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'parent' | 'child' | 'other')}
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
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Known Allergies
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                  {commonAllergens.map(allergen => (
                    <div key={allergen} style={{
                      padding: '0.75rem',
                      background: allergyData[allergen]?.selected ? 'rgba(34, 197, 94, 0.1)' : '#f9fafb',
                      border: `2px solid ${allergyData[allergen]?.selected ? '#22c55e' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <input
                        type="checkbox"
                        checked={allergyData[allergen]?.selected || false}
                        onChange={(e) => setAllergyData(prev => ({
                          ...prev,
                          [allergen]: { ...prev[allergen], selected: e.target.checked }
                        }))}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <span style={{ fontWeight: '500', color: '#374151', fontSize: '0.85rem', flex: 1 }}>
                        {allergen}
                      </span>
                      {allergyData[allergen]?.selected && (
                        <select
                          value={allergyData[allergen]?.severity || 'moderate'}
                          onChange={(e) => updateSeverity(allergen, e.target.value)}
                          style={{
                            width: '100px',
                            padding: '0.25rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            color: '#374151'
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

                {Object.keys(customAllergies).length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Custom Allergies
                    </h4>
                    {Object.entries(customAllergies).map(([allergen, data]) => (
                      <div key={allergen} style={{
                        padding: '0.75rem',
                        background: 'rgba(251, 191, 36, 0.1)',
                        border: '2px solid #fbbf24',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ fontWeight: '500', color: '#374151', fontSize: '0.85rem', flex: 1 }}>
                          {allergen}
                        </span>
                        <select
                          value={data.severity}
                          onChange={(e) => updateSeverity(allergen, e.target.value, true)}
                          style={{
                            width: '100px',
                            padding: '0.25rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                          }}
                        >
                          <option value="mild">Mild</option>
                          <option value="moderate">Moderate</option>
                          <option value="severe">Severe</option>
                          <option value="life-threatening">Life Threatening</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeCustomAllergy(allergen)}
                          style={{
                            padding: '0.25rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={customAllergen}
                    onChange={(e) => setCustomAllergen(e.target.value)}
                    placeholder="Add custom allergy"
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '0.85rem'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomAllergy();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addCustomAllergy}
                    disabled={!customAllergen.trim()}
                    style={{
                      padding: '0.5rem 1rem',
                      background: customAllergen.trim() ? '#22c55e' : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: customAllergen.trim() ? 'pointer' : 'not-allowed',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !name.trim()}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: (isSubmitting || !name.trim()) ? '#9ca3af' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: (isSubmitting || !name.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isSubmitting ? 'Saving...' : editingMember ? 'Update Family Member' : 'Add Family Member'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const MemberCard = ({ member }: { member: FamilyMember }) => {
    const RoleIcon = getRoleIcon(member.role);
    
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.9)',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              padding: '0.5rem',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <RoleIcon size={20} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                {member.name}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0', textTransform: 'capitalize' }}>
                {member.role}{member.age ? `, ${member.age} years old` : ''}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => handleEditMember(member)}
              style={{
                padding: '0.5rem',
                background: 'rgba(107, 114, 128, 0.1)',
                color: '#6b7280',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Edit3 size={16} />
            </button>
            <button 
              onClick={() => handleDeleteMember(member.id)}
              style={{
                padding: '0.5rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {member.allergies && member.allergies.length > 0 ? (
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Allergies ({member.allergies.length})
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {member.allergies.map((allergy, index) => (
                <span 
                  key={index}
                  style={{
                    padding: '0.125rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: 'white',
                    background: getSeverityColor(allergy.severity)
                  }}
                >
                  {allergy.name}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic' }}>
            No known allergies
          </p>
        )}
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
        <div>
          <p style={{ 
            fontSize: '0.9rem', 
            color: '#6b7280', 
            margin: '0' 
          }}>
            Manage your family members and their allergies 👨‍👩‍👧‍👦
          </p>
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
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
          }}
        >
          <Plus size={18} />
          Add Member
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #22c55e',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      ) : familyMembers.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.4)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.6)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍👩‍👧‍👦</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
            No Family Members Yet
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.5rem' }}>
            Add your first family member to start tracking allergies and keeping everyone safe.
          </p>
          <button
            onClick={() => setShowAddMember(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
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
            Add First Member
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {familyMembers.map(member => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}

      {showAddMember && <AddMemberForm />}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FamilyManagement;