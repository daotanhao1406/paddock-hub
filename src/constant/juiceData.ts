export interface JuiceData {
  title: string
  slug?: string
  description: string
  mainBgColor: string
  blurColor: string
  textColor: string
  accentColor: string
  buttonBgColor: string
  buttonTextColor: string
}

export const juiceData: JuiceData[] = [
  {
    title: 'Lemon Ginger',
    slug: 'lemon',
    description:
      'A zesty and refreshing blend with a spicy kick. Our Lemon Ginger juice combines the citrusy brightness of fresh lemons with the warming properties of ginger.',
    mainBgColor: '#82AF38',
    blurColor: '#E5F985',
    textColor: 'white',
    accentColor: 'rgba(255, 255, 255, 0.9)',
    buttonBgColor: 'white',
    buttonTextColor: '#82AF38',
  },
  {
    title: 'Blueberry Açai',
    slug: 'blueberry',
    description:
      'A nutrient-packed superfood blend. Our Blueberry Açai juice brings together antioxidant-rich berries with the exotic taste of açai for a delicious health boost.',
    mainBgColor: '#385dd2',
    blurColor: '#B6B6F9',
    textColor: 'white',
    accentColor: 'rgba(255, 255, 255, 0.9)',
    buttonBgColor: 'white',
    buttonTextColor: '#385dd2',
  },
  {
    title: 'Mango Burst',
    slug: 'mango',
    description:
      'A tropical explosion of sweetness. Our Mango Burst juice captures the sun-ripened goodness of premium mangoes for a taste of paradise in every sip.',
    mainBgColor: '#FFA500',
    blurColor: '#FFF3B6',
    textColor: '#222',
    accentColor: 'rgba(0,0,0,0.7)',
    buttonBgColor: 'white',
    buttonTextColor: '#FFA500',
  },
  {
    title: 'Raspberry Rosé',
    slug: 'raspberry',
    description:
      'An elegant and sophisticated blend. Our Raspberry Rosé juice combines the delicate sweetness of raspberries with subtle floral notes for a refined exp.',
    mainBgColor: '#FF6B81',
    blurColor: '#FFD6DE',
    textColor: 'white',
    accentColor: 'rgba(255,255,255,0.9)',
    buttonBgColor: 'white',
    buttonTextColor: '#FF6B81',
  },
]
