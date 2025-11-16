import { createServer } from '@/lib/supabase/server'

const supabase = createServer()

export async function getProducts(locale: string) {
  return (await supabase)
    .from('products_with_translations')
    .select('*')
    .eq('locale', locale)
}
