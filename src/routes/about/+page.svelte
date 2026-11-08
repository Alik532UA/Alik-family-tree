<svelte:head>
	<title>Про проєкт | Alik-family-tree</title>
	<meta
		name="description"
		content="Історія родинного архіву Запольнових та технічна довідка сайту."
	/>
</svelte:head>

<div class="about-page-container">
	<div class="about-header">
		<h1 class="page-title">Про родинне древо</h1>
		<p class="page-subtitle">
			Історія родинного архіву Запольнових, Булатів, Соколовських, Кульчицьких та Миндру
		</p>
	</div>

	<div class="about-card">
		<h2 class="card-title">📖 Історія та першоджерела</h2>
		<p class="card-text">
			Цей проєкт створено для збереження, дослідження та інтерактивного перегляду багатопоколінного
			генеалогічного архіву. Основою системи є деталізована векторна діаграма роду (версія <code
				>2023.02.05</code
			>), розроблена в середовищі Draw.io.
		</p>
		<p class="card-text">
			Архів налічує <strong>183 зафіксовані персони</strong> та
			<strong>323 родинні зв'язки</strong>, що охоплюють період від початку XIX століття
			(родоначальник Алентій Запольнов) до сучасного покоління (Алік Запольнов).
		</p>
	</div>

	<div class="about-card">
		<h2 class="card-title">🔒 Приватність та захист даних</h2>
		<p class="card-text">
			Згідно з етичними стандартами сучасної генеалогії, сайт реалізує концепцію «Розумної
			приватності»:
		</p>
		<ul class="card-list">
			<li>
				Загальна структура роду та предки минулих поколінь відкриті для перегляду дослідниками та
				родичами.
			</li>
			<li>
				Особисті деталі та контакти нині живих родичів захищені та доступні лише за введенням
				родинного PIN-коду.
			</li>
			<li>
				Код доступу зберігається виключно в локальній сесії браузера й не передається на сторонні
				сервери.
			</li>
		</ul>
	</div>

	<div class="about-card">
		<h2 class="card-title">⌨️ Гарячі клавіші для навігації</h2>
		<div class="hotkeys-table">
			<div class="hotkey-row">
				<span class="hotkey-keys"><kbd>/</kbd></span>
				<span class="hotkey-desc">Швидкий пошук родича у списку</span>
			</div>
			<div class="hotkey-row">
				<span class="hotkey-keys"><kbd>+</kbd> / <kbd>-</kbd></span>
				<span class="hotkey-desc">Збільшення та зменшення масштабу полотна</span>
			</div>
			<div class="hotkey-row">
				<span class="hotkey-keys"><kbd>0</kbd></span>
				<span class="hotkey-desc">Скидання масштабу на 100%</span>
			</div>
			<div class="hotkey-row">
				<span class="hotkey-keys"><kbd>Esc</kbd></span>
				<span class="hotkey-desc">Закрити картку персони або діалогове вікно</span>
			</div>
		</div>
	</div>

	<div class="about-card">
		<h2 class="card-title">⚙️ Інженерний стандарт</h2>
		<p class="card-text">
			Сайт побудований з дотриманням інженерних стандартів <code
				>sveltekit-canon/selection_criteria/v10</code
			>
			та <code>product_criteria/v10</code>:
		</p>
		<ul class="card-list">
			<li><strong>Фреймворк:</strong> SvelteKit 2 та Svelte 5 з використанням рун (Runes).</li>
			<li>
				<strong>Профіль:</strong> Static (@sveltejs/adapter-static) — висока швидкість, автономність,
				офлайн-готовність.
			</li>
			<li>
				<strong>Продуктовий канон:</strong> інтерактивна мінімапа полотна, фірмовий перемикач тем з прев'ю,
				тости повідомлень, кастомний скролбар.
			</li>
		</ul>
	</div>
</div>

<style>
	.about-page-container {
		max-width: 860px;
		margin: 0 auto;
		width: 100%;
		padding: 24px 16px;
		overflow-y: auto;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.page-title {
		font-size: 24px;
		font-weight: 800;
		margin: 0 0 6px;
	}

	.page-subtitle {
		font-size: 14px;
		color: var(--color-text-muted);
		margin: 0;
	}

	.about-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.card-title {
		font-size: 16px;
		font-weight: 700;
		margin: 0;
	}

	.card-text {
		font-size: 14px;
		line-height: 1.6;
		margin: 0;
	}

	.card-list {
		margin: 0;
		padding-left: 20px;
		font-size: 14px;
		line-height: 1.6;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	code {
		font-family: monospace;
		background: var(--color-surface-hover);
		padding: 2px 5px;
		border-radius: 4px;
		font-size: 12px;
	}

	.hotkeys-table {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.hotkey-row {
		display: flex;
		align-items: center;
		gap: 16px;
		font-size: 13px;
	}

	.hotkey-keys {
		width: 80px;
	}

	kbd {
		font-family: monospace;
		font-size: 12px;
		font-weight: 600;
		background: var(--color-surface-hover);
		border: 1px solid var(--color-border);
		padding: 2px 6px;
		border-radius: 4px;
	}

	.hotkey-desc {
		color: var(--color-text-muted);
	}
</style>
