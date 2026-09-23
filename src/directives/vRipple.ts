export const vRipple = {
  mounted(el: any) {
    el.classList.add('relative', 'overflow-hidden')

    const createRipple = (e: any) => {
      // Don't trigger ripple if button is disabled
      if (el.hasAttribute('disabled') || el.classList.contains('disabled')) return

      const rect = el.getBoundingClientRect()
      const circle = document.createElement('span')
      const diameter = Math.max(rect.width, rect.height)
      const radius = diameter / 2

      circle.style.width = circle.style.height = `${diameter}px`
      circle.style.left = `${e.clientX - rect.left - radius}px`
      circle.style.top = `${e.clientY - rect.top - radius}px`

      circle.className = 'absolute rounded-full bg-white/30 pointer-events-none animate-ripple'

      const existing = el.querySelector('.animate-ripple')
      if (existing) existing.remove()

      el.appendChild(circle)

      setTimeout(() => circle.remove(), 600)
    }

    // Use mousedown with capture phase so it runs before @click state changes
    el.addEventListener('mousedown', createRipple, { capture: true })
  },
}
