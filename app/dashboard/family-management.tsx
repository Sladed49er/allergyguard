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
      // TODO: Replace with actual API call
      // const response = await fetch('/api/family');
      // const data = await response.json();
      
      // Mock data for now
      const mockMembers: FamilyMember[] = [
        {
          id: '1',
          name: 'You',
          role: 'parent',
          allergies: [
            {
              id: '1',
              allergen: 'Peanuts',
              severity: 'severe',
              symptoms: 'Difficulty breathing, hives',
              notes: 'Always carry EpiPen'
            }
          ]
        }
      ];
      
      setFamilyMembers(mockMembers);
    } catch (error) {
      console.error('Failed to load family members:', error);
    } finally {
      setIsLoading(false);
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'parent': return Crown;
      case 'child': return Baby;
      default: return User;
    }
  };

  const AddMemberForm = () => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [role, setRole] = useState<'parent' | 'child' | 'other'>('child');
    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
    const [customAllergen, setCustomAllergen] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const newMember: FamilyMember = {
        id: Date.now().toString(),
        name,
        age: age ? parseInt(age) : undefined,
        role,
        allergies: selectedAllergies.map(allergen => ({
          id: Date.now().toString() + Math.random(),
          allergen,
          severity: 'moderate' as const
        }))
      };

      // TODO: Save to API
      setFamilyMembers([...familyMembers, newMember]);
      setShowAddMember(false);
      
      // Reset form
      setName('');
      setAge('');
      setRole('child');
      setSelectedAllergies([]);
    };

    const toggleAllergy = (allergen: string) => {
      setSelectedAllergies(prev => 
        prev.includes(allergen) 
          ? prev.filter(a => a !== allergen)
          : [...prev, allergen]
      );
    };

    const addCustomAllergy = () => {
      if (customAllergen.trim() && !selectedAllergies.includes(customAllergen.trim())) {
        setSelectedAllergies([...selectedAllergies, customAllergen.trim()]);
        setCustomAllergen('');
      }
    };

    return (
      <div className="add-member-form">
        <div className="form-header">
          <h3>Add Family Member</h3>
          <button 
            onClick={() => setShowAddMember(false)}
            className="close-button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              required
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age (optional)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age"
                className="form-input"
                min="0"
                max="120"
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="form-input"
              >
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Known Allergies</label>
            <div className="allergy-grid">
              {commonAllergens.map(allergen => (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => toggleAllergy(allergen)}
                  className={`allergy-chip ${selectedAllergies.includes(allergen) ? 'selected' : ''}`}
                >
                  {allergen}
                </button>
              ))}
            </div>
            
            <div className="custom-allergy">
              <input
                type="text"
                value={customAllergen}
                onChange={(e) => setCustomAllergen(e.target.value)}
                placeholder="Add custom allergy..."
                className="form-input"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAllergy())}
              />
              <button 
                type="button" 
                onClick={addCustomAllergy}
                className="add-custom-btn"
              >
                Add
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn">
              Add Family Member
            </button>
          </div>
        </form>
      </div>
    );
  };

  const MemberCard = ({ member }: { member: FamilyMember }) => {
    const RoleIcon = getRoleIcon(member.role);
    
    return (
      <div className="member-card">
        <div className="member-header">
          <div className="member-info">
            <div className="member-avatar">
              <RoleIcon size={24} />
            </div>
            <div>
              <h4>{member.name}</h4>
              <span className="member-details">
                {member.age && `${member.age} years old • `}
                {member.role}
              </span>
            </div>
          </div>
          
          <div className="member-actions">
            <button 
              className="edit-btn"
              onClick={() => setEditingMember(member)}
            >
              <Edit3 size={16} />
            </button>
          </div>
        </div>

        <div className="allergies-section">
          <h5>Allergies ({member.allergies.length})</h5>
          {member.allergies.length > 0 ? (
            <div className="allergies-list">
              {member.allergies.map(allergy => (
                <div 
                  key={allergy.id} 
                  className="allergy-item"
                  style={{ borderLeft: `4px solid ${getSeverityColor(allergy.severity)}` }}
                >
                  <div className="allergy-main">
                    <span className="allergy-name">{allergy.allergen}</span>
                    <span 
                      className="severity-badge"
                      style={{ backgroundColor: getSeverityColor(allergy.severity) }}
                    >
                      {allergy.severity}
                    </span>
                  </div>
                  {allergy.symptoms && (
                    <div className="allergy-symptoms">
                      Symptoms: {allergy.symptoms}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-allergies">
              <Heart size={20} style={{ color: '#22c55e' }} />
              <span>No known allergies</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="family-management">
      <div className="section-header">
        <div className="header-content">
          <Users size={22} />
          <div>
            <h2>Family Management</h2>
            <p>Manage your family members and their allergies</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowAddMember(true)}
          className="add-member-btn"
        >
          <Plus size={18} />
          Add Member
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="organic-spinner" />
          <p>Loading family members...</p>
        </div>
      ) : (
        <div className="members-grid">
          {familyMembers.map(member => (
            <MemberCard key={member.id} member={member} />
          ))}
          
          {familyMembers.length === 0 && (
            <div className="empty-state">
              <Users size={48} />
              <h3>No family members added yet</h3>
              <p>Add family members to track their specific allergies</p>
              <button 
                onClick={() => setShowAddMember(true)}
                className="add-first-member-btn"
              >
                <Plus size={18} />
                Add Your First Family Member
              </button>
            </div>
          )}
        </div>
      )}

      {showAddMember && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AddMemberForm />
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
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .add-member-form {
          padding: 2rem;
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
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(209, 213, 219, 0.8);
          border-radius: 8px;
          color: #1f2937;
          font-size: 0.9rem;
          transition: all 0.2s ease;
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
          background: rgba(107, 114, 128, 0.1);
          color: #374151;
          border: 1px solid rgba(107, 114, 128, 0.2);
          border-radius: 20px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .allergy-chip:hover {
          background: rgba(107, 114, 128, 0.15);
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
          background: rgba(107, 114, 128, 0.1);
          color: #374151;
          border: 1px solid rgba(107, 114, 128, 0.2);
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .add-custom-btn:hover {
          background: rgba(107, 114, 128, 0.15);
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