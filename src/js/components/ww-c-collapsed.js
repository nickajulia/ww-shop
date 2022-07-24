document.addEventListener('DOMContentLoaded', () => {
	// TODO: ww-collapsed needs to be modular
	document.querySelectorAll('.ww-collapsed__cta')
		.forEach((cta) => {
			cta.addEventListener('click', (evt) => {
				const collapsedEl = evt.currentTarget.closest('.ww-collapsed')
				if (!collapsedEl) return;

				if (collapsedEl.dataset.collapseGroup) {
					document.querySelectorAll(`${collapsedEl.dataset.collapseGroup} .ww-collapsed`)
						.forEach(collapseGroupItem => {
							collapseGroupItem.classList.toggle('ww-collapsed--active')
						})
				} else {
					collapsedEl.classList.toggle('ww-collapsed--active')
				}
			})
		})
});