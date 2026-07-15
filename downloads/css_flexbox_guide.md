# The Ultimate CSS Flexbox Cheat Sheet & Visual Guide
*Aegis Developer Hub Premium Resource Pack*

This guide compiles essential CSS Flexible Box Layout (Flexbox) properties, visual alignment maps, and production-ready component code blocks to help you structure pages without manual layout toil.

---

## 1. Flexbox Parent Container Properties

Activate a flex context by applying `display: flex` or `display: inline-flex` to the parent container.

### A. flex-direction
Controls the primary axis along which flex items are laid out.
* `row` (default): Horizontal, left to right.
* `row-reverse`: Horizontal, right to left.
* `column`: Vertical, top to bottom.
* `column-reverse`: Vertical, bottom to top.

### B. justify-content
Aligns items along the **main axis** (horizontal by default).
* `flex-start` (default): Items packed toward the start of the line.
* `flex-end`: Items packed toward the end of the line.
* `center`: Items centered along the line.
* `space-between`: Items distributed evenly; first item at the start, last item at the end.
* `space-around`: Items distributed evenly with equal space around them.
* `space-evenly`: Items distributed so that the spacing between any two items is equal.

### C. align-items
Aligns items along the **cross axis** (vertical by default).
* `stretch` (default): Stretch to fill the container (respects min-width/max-width).
* `flex-start`: Items placed at the start of the cross axis.
* `flex-end`: Items placed at the end of the cross axis.
* `center`: Items centered along the cross axis.
* `baseline`: Items aligned such that their baselines align.

### D. flex-wrap
Controls whether the flex container forces items into a single line or wraps them.
* `nowrap` (default): All flex items will be on one line.
* `wrap`: Flex items will wrap onto multiple lines, from top to bottom.
* `wrap-reverse`: Flex items will wrap onto multiple lines, from bottom to top.

---

## 2. Flexbox Child Item Properties

Applied to individual child elements inside a flex container.

### A. flex-grow
Defines the ability for a flex item to grow if necessary. It accepts a unitless value serving as a proportion.
* Default: `0` (does not grow).
* Example: If one child has `flex-grow: 2` and others have `1`, it takes up double the remaining space.

### B. flex-shrink
Defines the ability for a flex item to shrink if necessary.
* Default: `1` (shrinks to fit).
* `0`: Prevents the item from shrinking below its default size.

### C. flex-basis
Defines the default size of an element before the remaining space is distributed.
* Default: `auto`.
* Values: Length units (e.g. `20%`, `150px`, `10rem`).

### D. align-self
Allows the default alignment (or the one specified by `align-items`) to be overridden for individual flex items.
* Default: `auto`.
* Values: `flex-start`, `flex-end`, `center`, `baseline`, `stretch`.

---

## 3. Common Responsive Components (Copy-Paste Layouts)

### Centering a Card (The Absolute Center)
```css
.parent-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}
```

### Responsive Navigation Bar
```css
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    padding: 15px 30px;
}

@media (max-width: 600px) {
    .navbar {
        flex-direction: column;
        gap: 15px;
    }
}
```

### Sticky Footer Layout
```css
.page-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.content-body {
    flex-grow: 1; /* Pushes footer to the bottom */
}
```
