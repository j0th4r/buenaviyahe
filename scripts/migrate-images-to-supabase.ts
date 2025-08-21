import { readdir, readFile, stat } from 'fs/promises'
import { join } from 'path'
import { createServiceClient } from '../lib/supabase/config'

interface MigrationResult {
  originalPath: string
  storagePath: string
  publicUrl: string
  success: boolean
  error?: string
}

async function uploadBuffer(storagePath: string, buf: Buffer, mime: string) {
	const { error } = await svc.storage
		.from('images')
		.upload(storagePath, buf, { contentType: mime, upsert: true })
	if (error) throw error
	return svc.storage.from('images').getPublicUrl(storagePath).data.publicUrl
}

async function uploadImageFile(
  filePath: string, 
  storagePath: string
): Promise<MigrationResult> {
  try {
    const buf = await readFile(filePath)
    const fileName = filePath.split('/').pop() || ''
    const publicUrl = await uploadBuffer(storagePath, buf, getMimeType(fileName))

    return {
      originalPath: filePath,
      storagePath,
      publicUrl,
      success: true
    }
  } catch (error) {
    return {
      originalPath: filePath,
      storagePath,
      publicUrl: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    default:
      return 'image/jpeg'
  }
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path)
    return stats.isDirectory()
  } catch {
    return false
  }
}

async function migrateImages() {
  const results: MigrationResult[] = []
  
  // Migrate category images
  console.log(' Migrating category images...')
  const categoriesDir = join(process.cwd(), 'public', 'images', 'categories')
  
  try {
    const categoryFiles = await readdir(categoriesDir)
    
    for (const file of categoryFiles) {
      if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.webp')) {
        const filePath = join(categoriesDir, file)
        const storagePath = `categories/${file}`
        
        const result = await uploadImageFile(filePath, storagePath)
        results.push(result)
        
        console.log(`${result.success ? '✅' : '❌'} ${file}: ${result.success ? result.publicUrl : result.error}`)
      }
    }
  } catch (error) {
    console.error('Error reading categories directory:', error)
  }

  // Migrate spot images
  console.log('\n📁 Migrating spot images...')
  const spotsDir = join(process.cwd(), 'public', 'images', 'spots')
  
  try {
    const spotItems = await readdir(spotsDir)
    
    for (const item of spotItems) {
      const itemPath = join(spotsDir, item)
      
      // Check if it's a directory (skip README.md and other files)
      if (await isDirectory(itemPath)) {
        const spotFiles = await readdir(itemPath)
        
        for (const file of spotFiles) {
          if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.webp')) {
            const filePath = join(itemPath, file)
            const storagePath = `spots/${item}/${file}`
            
            const result = await uploadImageFile(filePath, storagePath)
            results.push(result)
            
            console.log(`${result.success ? '✅' : '❌'} ${item}/${file}: ${result.success ? result.publicUrl : result.error}`)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error reading spots directory:', error)
  }

  // Summary
  console.log('\n=== Migration Summary ===')
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log(`✅ Successful: ${successful.length}`)
  console.log(`❌ Failed: ${failed.length}`)
  
  if (failed.length > 0) {
    console.log('\nFailed uploads:')
    failed.forEach(f => console.log(`  - ${f.originalPath}: ${f.error}`))
  }

  // Generate URL mapping for database update
  console.log('\n=== URL Mapping for Database Update ===')
  console.log('Copy this mapping to update your database:')
  successful.forEach(result => {
    console.log(`"${result.originalPath}": "${result.publicUrl}"`)
  })
}

// Run migration
const svc = createServiceClient()
migrateImages().catch(console.error)
