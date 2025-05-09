# MagicMirror CreditCard Module

A simple MagicMirror² module that displays one or more horizontal progress bars for your credit‑card balances (used, available, etc.).

---

## Table of Contents

1. [Demo](#demo)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
   - [Configuration Options](#configuration-options)
   - [Example Config](#example-config)
5. [How it Works](#how-it-works)
6. [Contributing](#contributing)
7. [License](#license)

---

## Demo

![creditcard module screenshot](screenshot.png)

---

## Prerequisites

- MagicMirror² v2.19 or later
- Node.js v14+ (for the node-helper)
- npm (to install dependencies)

---

## Installation

1. Clone or copy this module into your MagicMirror `modules/` folder:

   ```bash
   cd ~/MagicMirror/modules
   git clone https://github.com/you/module-creditcard.git creditcard
   ```

   ```
   npm install node-fetch@2
   ```

2. Configuration
   If you would like to add data dynamically from an enpoint you will need to add it in the config.json\
   Json from endpoint will need to be formatted as such

```
[{"amount":900,"max":1000,"label":"CC"},{"amount":800,"max":1000,"label":"CC2"}]
```
