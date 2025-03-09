export default interface IUser {
    id: number
    name: string
    email: string
    avatar_path?: string
    created_at: string
    updated_at: string
    deleted_at: string
    email_verified_at: string
    roles: any[]
    tenant_id: number
  }