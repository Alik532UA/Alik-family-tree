---
Назва: Контекст проєкту Alik-family-tree
Канон: selection_criteria/v10 та product_criteria/v10
Дата оновлення: 2026-11-09
---

# Контекст проєкту: Alik-family-tree

## 1. Загальні відомості

- **Назва**: Alik Family Tree (Родинне генеалогічне древо)
- **Опис**: Інтерактивний сайт-візуалізатор родинного генеалогічного древа родини Запольнових, Булатів, Соколовських, Кульчицьких та споріднених гілок на базі архіву `2023.02.05`.
- **Стек**: SvelteKit (`@sveltejs/kit`), Svelte 5 (виключно Runes), TypeScript, `@sveltejs/adapter-static`, Lucide Svelte, CSS Variables.
- **Хостинг**: GitHub Pages (`https://alik.github.io/Alik-family-tree/`).
- **Гілка деплою**: `main`.

---

## 2. Базові параметри та конфігурація адресації (SEO-v10 § 1.2)

| Параметр                              | Значення                                                                    |
| ------------------------------------- | --------------------------------------------------------------------------- |
| Профіль розгортання                   | `static` (`@sveltejs/adapter-static`)                                       |
| Хостинг                               | GitHub Pages                                                                |
| Основна адреса                        | `https://alik.github.io/Alik-family-tree/`                                  |
| Базовий шлях (`BASE_PATH`)            | `/Alik-family-tree` (порожній при власному домені)                          |
| Спільний origin з іншими застосунками | ні (окремий домен/шлях)                                                     |
| Гілка деплою                          | `main`                                                                      |
| Метод деплою                          | GitHub Actions (`pages`)                                                    |
| Порт dev-сервера                      | 5173                                                                        |
| Тестовий порт preview                 | 4173                                                                        |
| Модель бампа версії                   | Версія на коміт/реліз (`scripts/bump-version.mjs`)                          |
| Мови інтерфейсу                       | `uk`                                                                        |
| Бекенд                                | Відсутній (повністю статичний клієнтський додаток із вбудованою базою JSON) |

---

## 3. Реєстр префіксів сховища (STORAGE-NAMESPACE-v10 § 1)

Сайт використовує суворо ізольований префікс для всіх записів у `localStorage` та `sessionStorage`. Прямий доступ повз фасад `$lib/services/storage.ts` заборонено.

| Застосунок       | Середовище  | Префікс          |
| ---------------- | ----------- | ---------------- |
| Alik-family-tree | production  | `alik_tree_`     |
| Alik-family-tree | development | `alik_tree_dev_` |

### Реєстр ключів сховища

| Ключ (без префікса) | Повний ключ у сховищі                 | Призначення                             | Дозволені значення                                  |
| ------------------- | ------------------------------------- | --------------------------------------- | --------------------------------------------------- |
| `theme`             | `alik_tree_theme`                     | Активна кольорова тема                  | `'light'`, `'dark'`, `'sepia'`, `'meadow'`, `'sky'` |
| `scrollbar_mode`    | `alik_tree_scrollbar_mode`            | Режим смуги прокрутки                   | `'native'`, `'hidden'`, `'custom'`                  |
| `family_unlocked`   | `alik_tree_family_unlocked` (session) | Доступ до приватних даних живих родичів | `'true'` (у session storage)                        |

---

## 4. Архітектура компонентів та модулів

1. **Інтерактивне полотно дерева (`src/lib/components/tree/`):**
   - `TreeCanvas.svelte`: Головне полотно з рендерингом карток осіб та ортогональних ліній спорідненості на SVG.
   - `PersonCard.svelte`: Інтерактивна картка особи з портретом, роками життя, статусом та швидким вибором.
   - `UnionPill.svelte`: Візуальний маркер шлюбних союзів з датами та розрахунком точок розгалуження.
   - `TreeMinimap.svelte`: Зменшена проекція всього дерева із прямокутником поточного огляду для швидкої орієнтації.
   - `PersonDrawer.svelte`: Бокова панель з детальною біографією, родинними зв'язками, документами та нотатками.
   - `GenerationTimeline.svelte`: Хронологічна лінійка поколінь (від пращурів XVIII–XIX ст. до сучасності).
   - `SearchBar.svelte`: Швидкий пошук персон за іменем, прізвищем, роками життя або дівочим прізвищем.
   - `PrivacyModal.svelte`: Модальне вікно активації сімейного доступу за захищеним PIN-кодом.

2. **Контролери та стан (`src/lib/controllers/`):**
   - `treeLayout.svelte.ts`: Розрахунок позицій карток за поколіннями, уникнення накладання зв'язків та ортогональні траєкторії ліній.
   - `treeViewport.svelte.ts`: Стан масштабування (zoom), панорамування (pan), центрування на обраній персоні, підтримка жестів Pinch-to-zoom.
   - `theme.svelte.ts` & `colorScheme.ts`: Керування 5 темами з підтримкою системних налаштувань (`prefers-color-scheme`).
   - `toast.svelte.ts`: Сповіщення користувача про успішний вхід, копіювання посилань або помилки навігації.

3. **Дані та обробка (`src/lib/data/` та `scripts/`):**
   - `parse-family-tree.mjs`: Конвертер архівного XML/Draw.io графа в нормалізований JSON-датасет (`familyTree.json`).
   - `familyTree.ts`: Типізовані словники персон, союзів, батьківських та дитячих відношень.

4. **Архітектурні рішення (ADR):**
   - [ADR 0001: SVG Canvas Layout Engine and Cryptographic Privacy Controls](docs/adr/0001-tree-canvas-and-privacy.md).
   - [ADR 0002: Scalable Tree Virtualization, Viewport Bounding and Playwright E2E Quality Gates](docs/adr/0002-scalable-virtualization-and-culling.md).

5. **Масштабованість полотна та віртуалізація:**
   - Картки осіб використовують браузерну віртуалізацію рендерингу (`content-visibility: auto`, `contain: layout style`).
   - Контролер `treeViewport.svelte.ts` обчислює `visibleBounds` та надає швидку геометричну фільтрацію `isCardInViewport()`.

---

## 5. Безпека та CSP (SECURITY-v10 & CSP-v10)

- **Режим CSP**: Хешування інлайн-скриптів у `svelte.config.js`.
- **Інлайн-скрипти**: Усі інлайн-скрипти першого кадру теми й скролбара в `src/app.html` автоматично хешуються SHA-256 із нормалізацією `CRLF -> LF`. Інваріант перевіряється тестом `src/csp-hash.test.ts`.
- **Захист від XSS**: Сувора заборона сирого використання `{@html}` без санітизації (контролюється тестом `src/security.test.ts`).
- **Криптографічний захист PIN**:
  - Відкриті паролі та персональні ідентифікатори повністю видалені з коду.
  - Валідація здійснюється виключно через порівняння SHA-256 сигнатур у `src/lib/services/privacy.svelte.ts`.
  - Сесійне збереження у `sessionStore` гарантує видалення доступу при закритті вкладки.
- **Аудит залежностей**: Скрипт `npm run audit:ci` (`scripts/check-audit.mjs`) автоматично блокує наявність вразливостей рівня High та Critical.

---

## 6. Надійність та Error Boundaries (ERROR-HANDLING-v10 § 2.2)

- **Клієнтський обробник (`src/hooks.client.ts`)**:
  - Логує неперехоплені помилки рендеру та навігації в `logService`.
  - Відловлює 404-помилки застарілих чанків (`chunkMissing`) після свіжих деплоїв і перезавантажує актуальну версію сторінки (`reloadOnce`).
- **Межа помилок Svelte 5 (`<svelte:boundary>`)**:
  - Усі маршрути в `src/routes/+layout.svelte` захищені граничним компонентом `ErrorFallback.svelte`, що запобігає білому екрану смерті.
- **Канонічна сторінка помилок (`src/routes/+error.svelte`)**:
  - Забезпечує стилізований 404 та загальний Error Boundary з кнопкою повернення на дерево та історією переходів.

---

## 7. Стандарти якості коду та CI/CD (CODE-QUALITY-v10 & CI-CD-AND-TOOLS-v10)

- **TypeScript Strictness**:
  - `"strict": true`
  - `"noUncheckedIndexedAccess": true`
  - `"noImplicitReturns": true`
- **Лінтинг та форматування**:
  - ESLint 9 Flat Config (`eslint.config.js`).
  - Prettier з плагіном `prettier-plugin-svelte`.
  - Команди: `npm run lint` (`lint:format` + `lint:code`), `npm run format`.
- **CI/CD Автоматизація та якість**:
  - GitHub Actions Workflow (`.github/workflows/deploy.yml`) на базі Node 22.
  - Обов'язкові гейти: `npm run audit:ci` -> `npm run check` -> `npm run lint` -> `npm run test:unit` -> `npm run test:e2e` -> `npm run build` -> `npm run check:build`.
  - Автоматичний пре-коміт контроль через Husky (`.husky/pre-commit`).
  - Регулярне оновлення залежностей через Dependabot (`.github/dependabot.yml`).

---

## 8. Доступність (a11y) та навігація

- **Skip Link та фокус**: Впроваджено `.skip-link` для швидкого переходу до `#main-content`, основний контейнер має `tabindex="-1"` для програмного фокусування.
- Повна клавіатурна навігація: `Tab` та стрілки для переміщення між персонами, `Enter` / `Space` для відкриття картки, `Esc` для закриття модальних вікон.
- Підтримка `prefers-reduced-motion`: плавне панорамування автоматично замінюється миттєвим переходом без анімацій.
- Семантичні ARIA-атрибути: `role="dialog"`, `aria-modal="true"`, `aria-label` для кнопок керування масштабом.
- Автоматичний регресійний a11y-тест `src/a11y.test.ts` гарантує збереження семантики та відсутність регресій розмітки.
