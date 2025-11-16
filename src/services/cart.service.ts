import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

import { createServer } from '@/lib/supabase/server'
import { compareObjects } from '@/lib/utils'

export async function getOrCreateCartSession() {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get('cart_session')?.value

  if (!sessionId) {
    sessionId = uuidv4()
    cookieStore.set('cart_session', sessionId, { maxAge: 60 * 60 * 24 * 7 })
  }

  return sessionId
}

export async function getUserCart(userId: string) {
  const supabase = await createServer()
  return await supabase.from('carts').select('*').eq('user_id', userId).single()
}

export async function getGuestCart(sessionId: string) {
  const supabase = await createServer()
  return await supabase
    .from('carts')
    .select('*')
    .eq('session_id', sessionId)
    .single()
}

export async function getCartItems(cartId: string, locale: string) {
  const supabase = await createServer()
  return await supabase
    .from('cart_items')
    .select(
      `*, product:products_with_translations(*), toppings:cart_item_toppings(
          id,
          topping:toppings_with_translations(*)
          )`,
    )
    .eq('cart_id', cartId)
    .eq('product.locale', locale)
    .eq('cart_item_toppings.topping.locale', locale)
}

export async function mergeGuestCartIntoUserCart(
  guestCartId: string,
  userCartId: string,
) {
  const supabase = await createServer()

  // 1️⃣ Lấy toàn bộ item của guestCart và userCart
  const { data: guestItems, error: guestError } = await supabase
    .from('cart_items')
    .select('*, cart_item_toppings(topping_id)')
    .eq('cart_id', guestCartId)

  const { data: userItems, error: userError } = await supabase
    .from('cart_items')
    .select('*, cart_item_toppings(topping_id)')
    .eq('cart_id', userCartId)

  if (guestError || userError)
    throw new Error(guestError?.message || userError?.message)

  if (!guestItems?.length) return

  // 2️⃣ Duyệt từng item trong guestCart
  for (const guestItem of guestItems) {
    const sameItem = userItems?.find((userItem) =>
      compareObjects(
        {
          product_id: userItem.product_id,
          size: userItem.size,
          sweetness_level: userItem.sweetness_level,
          ice_level: userItem.ice_level,
          note: userItem.note,
          cart_item_toppings: userItem.cart_item_toppings
            ?.map((t: { topping_id: string }) => t.topping_id)
            .sort(),
        },
        {
          product_id: guestItem.product_id,
          size: guestItem.size,
          sweetness_level: guestItem.sweetness_level,
          ice_level: guestItem.ice_level,
          note: guestItem.note,
          cart_item_toppings: guestItem.cart_item_toppings
            ?.map((t: { topping_id: string }) => t.topping_id)
            .sort(),
        },
        [
          'product_id',
          'size',
          'sweetness_level',
          'ice_level',
          'note',
          'cart_item_toppings',
        ],
      ),
    )

    if (sameItem) {
      // 3️⃣ Nếu trùng → cộng quantity
      await supabase
        .from('cart_items')
        .update({ quantity: sameItem.quantity + guestItem.quantity })
        .eq('id', sameItem.id)

      // Xóa item guest này để không duplicate
      await supabase.from('cart_items').delete().eq('id', guestItem.id)
    } else {
      // 4️⃣ Nếu không trùng → chuyển item sang cart user
      await supabase
        .from('cart_items')
        .update({ cart_id: userCartId })
        .eq('id', guestItem.id)
    }
  }

  // 5️⃣ Cập nhật lại cart_item_toppings (chúng vẫn giữ nguyên vì cart_item_id không đổi)
  // Không cần chỉnh toppings vì item_id vẫn là cùng 1 id.

  // 6️⃣ Xóa cart guest
  await supabase.from('carts').delete().eq('id', guestCartId)
}
