# Role-Based Authentication System

This document explains the comprehensive role-based authentication system implemented in Bread-Made-Easy.

## 🎯 **Overview**

The application now includes a robust role-based authentication system that provides:

- **User Roles**: `user` and `admin` with different permission levels
- **Permission-Based Access Control**: Granular permissions for different actions
- **Route Protection**: Automatic protection of admin-only routes
- **UI Adaptation**: Different interfaces based on user roles
- **Security**: Proper validation and access control

## 🔐 **User Roles**

### **User (`user`)**
- Basic user account
- Can bid on auctions
- Can make purchases
- Can submit custom requests
- Can view and edit own profile
- Access to public features

### **Admin (`admin`)**
- Full system access
- All user permissions plus:
  - View and manage all users
  - View and manage all auctions
  - View and manage all purchases
  - View and manage all leads
  - View and manage all custom requests
  - Manage categories and tags
  - View analytics and reports
  - Access admin panel

## 🛡️ **Permission System**

### **Permission Structure**
```typescript
export const ROLE_PERMISSIONS = {
  user: {
    canViewAuctions: true,
    canPlaceBids: true,
    canMakePurchases: true,
    canSubmitCustomRequests: true,
    canViewOwnProfile: true,
    canEditOwnProfile: true,
  },
  admin: {
    // All user permissions +
    canViewAllUsers: true,
    canEditAllUsers: true,
    canViewAllAuctions: true,
    canEditAllAuctions: true,
    canViewAllPurchases: true,
    canViewAllLeads: true,
    canViewAllCustomRequests: true,
    canManageCategories: true,
    canManageTags: true,
    canViewAnalytics: true,
    canAccessAdminPanel: true,
  },
}
```

### **Permission Checking**
```typescript
// Check if user has specific role
const isAdmin = authService.hasRole(user, 'admin')
const isUser = authService.hasRole(user, ['user', 'admin'])

// Check if user has specific permission
const canManageUsers = authService.hasPermission(user, 'canViewAllUsers')
const canAccessAdmin = authService.hasPermission(user, 'canAccessAdminPanel')
```

## 🚪 **Route Protection**

### **RoleGuard Component**
The main component for protecting routes based on roles and permissions:

```typescript
import { RoleGuard } from '@/components/auth/role-guard'

// Protect by role
<RoleGuard requiredRole="admin">
  <AdminDashboard />
</RoleGuard>

// Protect by permission
<RoleGuard requiredPermission="canViewAnalytics">
  <AnalyticsPage />
</RoleGuard>

// Multiple roles
<RoleGuard requiredRole={['user', 'admin']}>
  <UserDashboard />
</RoleGuard>
```

### **Convenience Components**
```typescript
// Admin only
<AdminOnly>
  <AdminContent />
</AdminOnly>

// User only
<UserOnly>
  <UserContent />
</UserOnly>

// Authenticated users
<AuthenticatedOnly>
  <ProtectedContent />
</AuthenticatedOnly>

// Permission-based
<CanViewAdminPanel>
  <AdminPanel />
</CanViewAdminPanel>

<CanManageUsers>
  <UserManagement />
</CanManageUsers>
```

## 🔧 **Implementation Details**

### **1. Authentication Service (`lib/auth.ts`)**
- Enhanced with role-based methods
- Permission checking functions
- User role management
- Admin-only operations

### **2. Role Guard Component (`components/auth/role-guard.tsx`)**
- Route protection logic
- Loading states
- Access denied handling
- Redirect functionality

### **3. Admin Layout (`components/admin/admin-layout.tsx`)**
- Role-based access control
- User authentication checks
- Proper fallback handling

### **4. Admin Sidebar (`components/admin/admin-sidebar.tsx`)**
- Dynamic navigation based on permissions
- User role display
- Filtered menu items

### **5. User Management (`app/admin/users/page.tsx`)**
- Admin-only user management
- Role editing capabilities
- Permission-based access

## 📱 **User Interface**

### **Signup Form**
- Role selection during registration
- Clear permission explanations
- Validation and feedback

### **Admin Panel**
- Role-based navigation
- User information display
- Permission indicators

### **Access Denied Pages**
- Clear error messages
- Role information display
- Navigation options

## 🔒 **Security Features**

### **Server-Side Validation**
- Database-level role checks
- Permission validation
- Secure role updates

### **Client-Side Protection**
- Route guards
- Component-level access control
- UI adaptation based on roles

### **Data Access Control**
- Role-based data filtering
- Permission-based operations
- Secure admin functions

## 📋 **Usage Examples**

### **Protecting Admin Routes**
```typescript
// In admin page
export default function AdminPage() {
  return (
    <CanViewAdminPanel>
      <AdminLayout>
        <AdminContent />
      </AdminLayout>
    </CanViewAdminPanel>
  )
}
```

### **Conditional UI Rendering**
```typescript
function Dashboard() {
  const user = authService.getCurrentUser()
  
  return (
    <div>
      {authService.isAdmin(user) && (
        <AdminStats />
      )}
      {authService.isUser(user) && (
        <UserStats />
      )}
    </div>
  )
}
```

### **Permission-Based Actions**
```typescript
function UserActions() {
  const user = authService.getCurrentUser()
  
  return (
    <div>
      <Button onClick={handleBid}>Place Bid</Button>
      
      {authService.hasPermission(user, 'canViewAllUsers') && (
        <Button onClick={handleManageUsers}>Manage Users</Button>
      )}
    </div>
  )
}
```

## 🚀 **Getting Started**

### **1. Create Admin User**
```typescript
// During signup, select 'admin' role
const response = await authService.signup(email, password, name, 'admin')
```

### **2. Protect Routes**
```typescript
// Wrap admin pages with role guards
<AdminOnly>
  <AdminPage />
</AdminOnly>
```

### **3. Check Permissions**
```typescript
// In components, check user permissions
if (authService.hasPermission(user, 'canManageUsers')) {
  // Show user management UI
}
```

### **4. Update User Roles**
```typescript
// Admin can update user roles
const success = await authService.updateUserRole(userId, 'admin')
```

## 🔍 **Testing**

### **Role Testing**
1. Create user account with 'user' role
2. Verify limited access to admin features
3. Create admin account
4. Verify full access to all features

### **Permission Testing**
1. Test each permission individually
2. Verify UI adaptation based on roles
3. Test route protection
4. Verify admin-only functions

## 🛠️ **Customization**

### **Adding New Roles**
```typescript
// In types.ts
export type UserRole = 'user' | 'admin' | 'moderator'

// In auth.ts
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
}
```

### **Adding New Permissions**
```typescript
// In auth.ts
export const ROLE_PERMISSIONS = {
  user: {
    // ... existing permissions
    canModerateComments: false,
  },
  admin: {
    // ... existing permissions
    canModerateComments: true,
  },
  moderator: {
    // ... user permissions
    canModerateComments: true,
    canViewAllUsers: true,
  },
}
```

### **Custom Role Guards**
```typescript
export function ModeratorOnly({ children, ...props }) {
  return (
    <RoleGuard requiredRole="moderator" {...props}>
      {children}
    </RoleGuard>
  )
}
```

## 📊 **Monitoring & Analytics**

### **Access Logging**
- Role-based access attempts
- Permission violations
- Admin actions tracking

### **User Analytics**
- Role distribution
- Permission usage
- Access patterns

## 🔮 **Future Enhancements**

- **Role Hierarchies**: Nested role structures
- **Dynamic Permissions**: Runtime permission changes
- **Audit Logging**: Comprehensive action tracking
- **Multi-Tenancy**: Organization-based roles
- **API Protection**: Server-side role validation

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Access Denied Errors**
   - Check user role in database
   - Verify permission configuration
   - Check role guard implementation

2. **UI Not Adapting**
   - Verify permission checks
   - Check component props
   - Validate role data

3. **Admin Functions Not Working**
   - Verify admin role assignment
   - Check permission methods
   - Validate database queries

### **Debug Mode**
```typescript
// Enable detailed logging
console.log('User:', user)
console.log('Role:', user.role)
console.log('Permissions:', authService.hasPermission(user, 'canAccessAdminPanel'))
```

---

This role-based authentication system provides a secure, scalable foundation for managing user access and permissions in your Bread-Made-Easy application.
