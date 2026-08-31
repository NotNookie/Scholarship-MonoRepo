import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { TenantProvider } from './tenant/TenantContext'

export default function App() {
  return (
    <TenantProvider>
      <RouterProvider router={router} />
    </TenantProvider>
  )
}
