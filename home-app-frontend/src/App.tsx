import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Notifications } from '@mantine/notifications'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Notifications />
      <div>
        <h1>Home App</h1>
        <p>Frontend initialization complete with Mantine and TanStack Query.</p>
      </div>
    </QueryClientProvider>
  )
}

export default App
