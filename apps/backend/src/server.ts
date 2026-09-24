import { createApp } from './app.js'
import { connectDB } from './config/db.js'
import { env } from './config/env.js'

async function bootstrap(): Promise<void> {
  try {
    await connectDB()
    const app = createApp()
    app.listen(env.PORT, () => {
      console.log(`🚀 Commyrce API listening on http://localhost:${env.PORT}`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

void bootstrap()