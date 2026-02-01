# dash-axios-hook

A React hook package for making HTTP requests with axios in the DASH framework. This hook provides automatic API prefix handling and is designed to work seamlessly with DASH's authentication system.

## Installation

This package is part of the DASH monorepo and is installed automatically when you install the workspace dependencies.

```bash
pnpm install
```

## Features

- 🔐 **Automatic authentication** - Integrates with DASH auth system
- 🔄 **API prefix handling** - Automatically appends `/api` to all requests
- 📦 **TypeScript support** - Full type definitions included
- ⚡ **React hook interface** - Easy to use in functional components

## Basic Usage

### Simple GET Request

```tsx
import { useAxios } from 'dash-axios-hook';

function MyComponent() {
    const { axios } = useAxios();
    const [data, setData] = useState(null);
    
    useEffect(() => {
        const fetchData = async () => {
            // axios automatically appends "/api" prefix
            // This calls: /api/tenancy/users
            const response = await axios.get('tenancy/users');
            setData(response.data);
        };
        
        fetchData();
    }, [axios]);
    
    return <div>{JSON.stringify(data)}</div>;
}
```

### POST Request with Data

```tsx
import { useAxios } from 'dash-axios-hook';

function CreateUserForm() {
    const { axios } = useAxios();
    
    const handleSubmit = async (formData) => {
        try {
            // This calls: /api/tenancy/users
            const response = await axios.post('tenancy/users', {
                name: formData.name,
                email: formData.email,
            });
            
            console.log('User created:', response.data);
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };
    
    return <form onSubmit={handleSubmit}>...</form>;
}
```

### PUT/PATCH Request

```tsx
import { useAxios } from 'dash-axios-hook';

function UpdateUserForm({ userId }) {
    const { axios } = useAxios();
    
    const handleUpdate = async (formData) => {
        // This calls: /api/tenancy/users/123
        await axios.put(`tenancy/users/${userId}`, formData);
    };
    
    return <form onSubmit={handleUpdate}>...</form>;
}
```

### DELETE Request

```tsx
import { useAxios } from 'dash-axios-hook';

function DeleteUserButton({ userId }) {
    const { axios } = useAxios();
    
    const handleDelete = async () => {
        // This calls: /api/tenancy/users/123
        await axios.delete(`tenancy/users/${userId}`);
    };
    
    return <button onClick={handleDelete}>Delete</button>;
}
```

## Advanced Usage

### Custom Hook for Specific Resource

Create reusable hooks for specific API endpoints:

```tsx
import { useState, useEffect } from 'react';
import { useAxios } from 'dash-axios-hook';

export interface PaymentGatewayCapabilities {
    billing_cycles: string[];
    supports_subscriptions: boolean;
    supports_trials: boolean;
}

export interface PaymentGatewayCapabilitiesResponse {
    gateway: string;
    gateway_name: string;
    capabilities: PaymentGatewayCapabilities;
}

/**
 * Hook to fetch payment gateway capabilities for the current tenancy
 */
export const usePaymentGatewayCapabilities = () => {
    const { axios } = useAxios();
    const [data, setData] = useState<PaymentGatewayCapabilitiesResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchCapabilities = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                // axios automatically appends "/api" prefix
                // This calls: /api/tenancy/payment-gateway/capabilities
                const response = await axios.get<PaymentGatewayCapabilitiesResponse>(
                    'tenancy/payment-gateway/capabilities'
                );
                
                setData(response.data);
            } catch (err) {
                console.error('Error fetching payment gateway capabilities:', err);
                setError(err as Error);
                
                // Set fallback data on error
                setData({
                    gateway: 'unknown',
                    gateway_name: 'Unknown Gateway',
                    capabilities: {
                        billing_cycles: ['monthly'],
                        supports_subscriptions: false,
                        supports_trials: false,
                    }
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchCapabilities();
    }, [axios]);

    return {
        data,
        gateway: data?.gateway ?? null,
        gatewayName: data?.gateway_name ?? null,
        capabilities: data?.capabilities ?? {
            billing_cycles: ['monthly'],
            supports_subscriptions: false,
            supports_trials: false,
        },
        supportedBillingCycles: data?.capabilities?.billing_cycles ?? ['monthly'],
        isLoading,
        error,
    };
};

// Usage in component:
function SubscriptionPlans() {
    const { supportedBillingCycles, isLoading } = usePaymentGatewayCapabilities();
    
    if (isLoading) return <CircularProgress />;
    
    // Filter plans based on gateway capabilities
    const filteredPlans = plans.filter(plan => 
        supportedBillingCycles.includes(plan.billing_cycle)
    );
    
    return <PlansList plans={filteredPlans} />;
}
```

### With Loading States and Error Handling

```tsx
import { useState, useEffect } from 'react';
import { useAxios } from 'dash-axios-hook';

function UsersList() {
    const { axios } = useAxios();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await axios.get('tenancy/users');
                setUsers(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUsers();
    }, [axios]);
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
        <ul>
            {users.map(user => (
                <li key={user.id}>{user.name}</li>
            ))}
        </ul>
    );
}
```

### Query Parameters

```tsx
import { useAxios } from 'dash-axios-hook';

function FilteredUsers() {
    const { axios } = useAxios();
    
    const fetchUsers = async (filters) => {
        // This calls: /api/tenancy/users?role=admin&status=active
        const response = await axios.get('tenancy/users', {
            params: {
                role: filters.role,
                status: filters.status,
            }
        });
        
        return response.data;
    };
    
    return <div>...</div>;
}
```

### File Upload

```tsx
import { useAxios } from 'dash-axios-hook';

function FileUpload() {
    const { axios } = useAxios();
    
    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', 'My Document');
        
        // This calls: /api/tenancy/documents
        const response = await axios.post('tenancy/documents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data;
    };
    
    return <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />;
}
```

## Important Notes

### Automatic `/api` Prefix

The `useAxios` hook **automatically prepends `/api`** to all requests. Do not include `/api` in your URLs:

```tsx
// ✅ Correct
await axios.get('tenancy/users');  // Calls: /api/tenancy/users

// ❌ Incorrect
await axios.get('/api/tenancy/users');  // Calls: /api/api/tenancy/users
```

### Authentication

The hook automatically includes authentication tokens from the DASH auth system. No additional configuration is needed.

### Error Handling

Always wrap axios calls in try-catch blocks:

```tsx
try {
    const response = await axios.get('tenancy/users');
    // Handle success
} catch (error) {
    // Handle error
    if (error.response) {
        // Server responded with error status
        console.error('Server error:', error.response.data);
    } else if (error.request) {
        // Request made but no response
        console.error('Network error');
    } else {
        // Error setting up request
        console.error('Request error:', error.message);
    }
}
```

## TypeScript Support

The hook supports TypeScript generics for type-safe responses:

```tsx
interface User {
    id: number;
    name: string;
    email: string;
}

const { axios } = useAxios();

// Type-safe response
const response = await axios.get<User[]>('tenancy/users');
// response.data is now typed as User[]
```

## API Reference

### `useAxios()`

Returns an object with an axios instance configured for the DASH API.

**Returns:**
- `axios`: Configured axios instance with automatic `/api` prefix

**Example:**
```tsx
const { axios } = useAxios();
```

## Best Practices

1. **Always use the hook at component level**, not in utility functions
2. **Include error handling** for all requests
3. **Use loading states** for better UX
4. **Don't include `/api`** in your URLs - it's added automatically
5. **Create custom hooks** for reusable API logic
6. **Use TypeScript generics** for type safety

## Contributing

This package is part of the DASH monorepo. See the main repository README for contribution guidelines.
