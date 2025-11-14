// Глобальные переменные
let currentProperties = {};
let currentServerPath = '';

// Группировка свойств по категориям
const propertyGroups = {
    'general': [
        'motd', 'max-players', 'difficulty', 'gamemode', 'hardcore', 'pvp'
    ],
    'world': [
        'level-seed', 'level-type', 'spawn-protection',
        'generate-structures', 'spawn-animals', 'spawn-monsters', 'spawn-npcs'
    ],
    'network': [
        'server-port', 'online-mode', 'enforce-secure-profile', 'allow-nether', 'allow-flight',
        'view-distance', 'simulation-distance'
    ],
    'security': [
        'white-list', 'enable-command-block', 'enable-rcon',
        'rcon.password', 'rcon.port'
    ]
};

// Названия групп для отображения (без эмодзи)
const groupNames = {
    'general': 'Основные настройки',
    'world': 'Настройки мира',
    'network': 'Сетевые настройки',
    'security': 'Настройки безопасности'
};

// Имена свойств для отображения
const propertyLabels = {
    'motd': 'Описание сервера',
    'max-players': 'Максимум игроков',
    'difficulty': 'Сложность',
    'gamemode': 'Режим игры',
    'hardcore': 'Хардкор',
    'pvp': 'PvP',
    'level-seed': 'Сид мира',
    'level-type': 'Тип мира',
    'spawn-protection': 'Защита спавна',
    'generate-structures': 'Генерировать структуры',
    'spawn-animals': 'Спавн животных',
    'spawn-monsters': 'Спавн монстров',
    'spawn-npcs': 'Спавн NPC',
    'server-port': 'Порт сервера',
    'online-mode': 'Онлайн-режим',
    'enforce-secure-profile': 'Безопасный чат',
    'allow-nether': 'Разрешить Незер',
    'allow-flight': 'Разрешить полёт',
    'view-distance': 'Дистанция обзора',
    'simulation-distance': 'Дистанция симуляции',
    'white-list': 'Белый список',
    'enable-command-block': 'Командные блоки',
    'enable-rcon': 'Включить RCON',
    'rcon.password': 'Пароль RCON',
    'rcon.port': 'Порт RCON'
};

// Типы мира для кнопок
const worldTypes = {
    'minecraft:normal': 'Обычный',
    'minecraft:flat': 'Плоский',
    'minecraft:large_biomes': 'Большие биомы',
    'minecraft:amplified': 'Увеличенный'
};

// Сложности для кнопок
const difficulties = {
    'peaceful': 'Мирная',
    'easy': 'Лёгкая',
    'normal': 'Нормальная',
    'hard': 'Сложная'
};

// Режимы игры для кнопок
const gamemodes = {
    'survival': 'Выживание',
    'creative': 'Творчество',
    'adventure': 'Приключение',
    'spectator': 'Наблюдатель'
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    await initializeEditor();
    setupEventListeners();
});

async function initializeEditor() {
    try {
        // Получаем информацию о сервере
        const serverInfo = await eel.get_server_info()();
        currentServerPath = serverInfo.server_path;

        // Обновляем информацию о пути
        document.getElementById('pathInfo').textContent = currentServerPath;

        // Загружаем свойства из файла
        const result = await eel.load_properties()();
        if (result.success) {
            currentProperties = result.properties;
            generatePropertiesUI();
            updateStatus('Готово');
        } else {
            updateStatus('Ошибка загрузки: ' + result.error);
        }
    } catch (error) {
        console.error('Error initializing editor:', error);
        updateStatus('Ошибка инициализации');
    }
}

function setupEventListeners() {
    document.getElementById('saveBtn').addEventListener('click', saveProperties);
}

async function saveProperties() {
    try {
        updateStatus('Сохранение...');
        const result = await eel.save_properties(currentProperties)();
        if (result.success) {
            updateStatus('Настройки успешно сохранены!');
            // Закрываем программу после успешного сохранения
            setTimeout(() => {
                window.close();
            }, 1000);
        } else {
            updateStatus('Ошибка сохранения: ' + result.error);
        }
    } catch (error) {
        console.error('Error saving properties:', error);
        updateStatus('Ошибка сохранения');
    }
}

function generatePropertiesUI() {
    const container = document.getElementById('propertiesList');
    container.innerHTML = '';

    // Создаем UI для каждой группы свойств
    for (const [groupId, properties] of Object.entries(propertyGroups)) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'property-group';

        const groupTitle = document.createElement('h3');
        groupTitle.textContent = groupNames[groupId];
        groupDiv.appendChild(groupTitle);

        // Добавляем компактные строки для определенных групп
        if (groupId === 'general') {
            groupDiv.appendChild(createHardcorePvpRow());
        }

        if (groupId === 'network') {
            groupDiv.appendChild(createOnlineSecureRow());
            groupDiv.appendChild(createNetherFlightRow());
        }

        if (groupId === 'world') {
            groupDiv.appendChild(createStructuresAnimalsRow());
            groupDiv.appendChild(createMonstersNpcsRow());
        }

        if (groupId === 'security') {
            groupDiv.appendChild(createSecurityRow());
        }

        // Добавляем остальные свойства группы
        properties.forEach(propId => {
            if (currentProperties.hasOwnProperty(propId)) {
                const propertyItem = createPropertyItem(propId, currentProperties[propId]);
                if (propertyItem) {
                    groupDiv.appendChild(propertyItem);
                }
            }
        });

        container.appendChild(groupDiv);
    }
}

function createPropertyItem(propId, value) {
    // Специальная обработка для компактных строк
    if (propId === 'hardcore' || propId === 'pvp' ||
        propId === 'online-mode' || propId === 'enforce-secure-profile' ||
        propId === 'generate-structures' || propId === 'spawn-animals' ||
        propId === 'spawn-monsters' || propId === 'spawn-npcs' ||
        propId === 'allow-nether' || propId === 'allow-flight' ||
        propId === 'white-list' || propId === 'enable-command-block' || propId === 'enable-rcon') {
        return null; // Будем обрабатывать отдельно
    }

    const itemDiv = document.createElement('div');
    itemDiv.className = 'property-item';

    const labelDiv = document.createElement('div');
    labelDiv.className = 'property-label';
    labelDiv.textContent = propertyLabels[propId] || propId;

    const controlDiv = document.createElement('div');
    controlDiv.className = 'property-control';

    // Определяем тип контрола на основе типа значения и имени свойства
    if (typeof value === 'boolean') {
        controlDiv.appendChild(createCheckboxControl(propId, value));
    } else if (propId === 'level-type') {
        controlDiv.appendChild(createWorldTypeButtons(propId, value));
    } else if (propId === 'difficulty') {
        controlDiv.appendChild(createDifficultyButtons(propId, value));
    } else if (propId === 'gamemode') {
        controlDiv.appendChild(createGamemodeButtons(propId, value));
    } else if (typeof value === 'number') {
        controlDiv.appendChild(createNumberControl(propId, value));
    } else {
        controlDiv.appendChild(createTextControl(propId, value));
    }

    itemDiv.appendChild(labelDiv);
    itemDiv.appendChild(controlDiv);

    return itemDiv;
}

// Создаем компактную строку для хардкора и PvP
function createHardcorePvpRow() {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'property-item compact-row-item';

    const controlDiv = document.createElement('div');
    controlDiv.className = 'property-control compact-row';

    // Создаем компактные чекбоксы для хардкора и PvP
    const hardcoreCheckbox = createCompactCheckbox('hardcore', currentProperties['hardcore'], 'Хардкор');
    const pvpCheckbox = createCompactCheckbox('pvp', currentProperties['pvp'], 'PvP');

    controlDiv.appendChild(hardcoreCheckbox);
    controlDiv.appendChild(pvpCheckbox);

    itemDiv.appendChild(controlDiv);

    return itemDiv;
}

// Создаем компактную строку для онлайн-режима и безопасного чата
function createOnlineSecureRow() {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'property-item compact-row-item';

    const controlDiv = document.createElement('div');
    controlDiv.className = 'property-control compact-row';

    // Создаем компактные чекбоксы для онлайн-режима и безопасного чата
    const onlineCheckbox = createCompactCheckbox('online-mode', currentProperties['online-mode'], 'Онлайн-режим');
    const secureCheckbox = createCompactCheckbox('enforce-secure-profile', currentProperties['enforce-secure-profile'], 'Безопасный чат');

    controlDiv.appendChild(onlineCheckbox);
    controlDiv.appendChild(secureCheckbox);

    itemDiv.appendChild(controlDiv);

    return itemDiv;
}

// Создаем компактную строку для Незера и полёта
function createNetherFlightRow() {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'property-item compact-row-item';

    const controlDiv = document.createElement('div');
    controlDiv.className = 'property-control compact-row';

    // Создаем компактные чекбоксы для Незера и полёта
    const netherCheckbox = createCompactCheckbox('allow-nether', currentProperties['allow-nether'], 'Разрешить Незер');
    const flightCheckbox = createCompactCheckbox('allow-flight', currentProperties['allow-flight'], 'Разрешить полёт');

    controlDiv.appendChild(netherCheckbox);
    controlDiv.appendChild(flightCheckbox);

    itemDiv.appendChild(controlDiv);

    return itemDiv;
}

// Создаем компактную строку для структур и животных
function createStructuresAnimalsRow() {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'property-item compact-row-item';

    const controlDiv = document.createElement('div');
    controlDiv.className = 'property-control compact-row';

    // Создаем компактные чекбоксы для структур и животных
    const structuresCheckbox = createCompactCheckbox('generate-structures', currentProperties['generate-structures'], 'Генерировать структуры');
    const animalsCheckbox = createCompactCheckbox('spawn-animals', currentProperties['spawn-animals'], 'Спавн животных');

    controlDiv.appendChild(structuresCheckbox);
    controlDiv.appendChild(animalsCheckbox);

    itemDiv.appendChild(controlDiv);

    return itemDiv;
}

// Создаем компактную строку для монстров и NPC
function createMonstersNpcsRow() {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'property-item compact-row-item';

    const controlDiv = document.createElement('div');
    controlDiv.className = 'property-control compact-row';

    // Создаем компактные чекбоксы для монстров и NPC
    const monstersCheckbox = createCompactCheckbox('spawn-monsters', currentProperties['spawn-monsters'], 'Спавн монстров');
    const npcsCheckbox = createCompactCheckbox('spawn-npcs', currentProperties['spawn-npcs'], 'Спавн NPC');

    controlDiv.appendChild(monstersCheckbox);
    controlDiv.appendChild(npcsCheckbox);

    itemDiv.appendChild(controlDiv);

    return itemDiv;
}

// Создаем компактную строку для безопасности (белый список, командные блоки, RCON)
function createSecurityRow() {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'property-item compact-row-item';

    const controlDiv = document.createElement('div');
    controlDiv.className = 'property-control compact-row triple';

    // Создаем компактные чекбоксы для безопасности
    const whitelistCheckbox = createCompactCheckbox('white-list', currentProperties['white-list'], 'Белый список');
    const commandBlockCheckbox = createCompactCheckbox('enable-command-block', currentProperties['enable-command-block'], 'Командные блоки');
    const rconCheckbox = createCompactCheckbox('enable-rcon', currentProperties['enable-rcon'], 'Включить RCON');

    controlDiv.appendChild(whitelistCheckbox);
    controlDiv.appendChild(commandBlockCheckbox);
    controlDiv.appendChild(rconCheckbox);

    itemDiv.appendChild(controlDiv);

    return itemDiv;
}

function createCompactCheckbox(propId, value, labelText) {
    const container = document.createElement('label');
    container.className = 'checkbox-container compact-checkbox';

    const label = document.createElement('span');
    label.className = 'checkbox-label compact-label';
    label.textContent = labelText;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = value;
    checkbox.addEventListener('change', (e) => {
        currentProperties[propId] = e.target.checked;
    });

    const customCheckbox = document.createElement('span');
    customCheckbox.className = 'checkbox-custom';

    container.appendChild(label);
    container.appendChild(checkbox);
    container.appendChild(customCheckbox);

    return container;
}

function createCheckboxControl(propId, value) {
    const container = document.createElement('label');
    container.className = 'checkbox-container';

    const label = document.createElement('span');
    label.className = 'checkbox-label';
    label.textContent = value ? 'ВКЛ' : 'ВЫКЛ';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = value;
    checkbox.addEventListener('change', (e) => {
        currentProperties[propId] = e.target.checked;
    });

    const customCheckbox = document.createElement('span');
    customCheckbox.className = 'checkbox-custom';

    // Обновляем текст при изменении
    checkbox.addEventListener('change', (e) => {
        label.textContent = e.target.checked ? 'ВКЛ' : 'ВЫКЛ';
    });

    container.appendChild(label);
    container.appendChild(checkbox);
    container.appendChild(customCheckbox);

    return container;
}

function createWorldTypeButtons(propId, value) {
    const container = document.createElement('div');
    container.className = 'world-type-buttons';

    // Создаем кнопки для каждого типа мира
    for (const [worldType, label] of Object.entries(worldTypes)) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'world-type-btn';
        button.textContent = label;

        // Подсвечиваем активную кнопку
        if (worldType === value) {
            button.classList.add('active');
        }

        // Обработчик клика
        button.addEventListener('click', () => {
            // Убираем активный класс у всех кнопок
            container.querySelectorAll('.world-type-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Добавляем активный класс к нажатой кнопке
            button.classList.add('active');

            // Обновляем значение свойства
            currentProperties[propId] = worldType;
        });

        container.appendChild(button);
    }

    return container;
}

function createDifficultyButtons(propId, value) {
    const container = document.createElement('div');
    container.className = 'difficulty-buttons';

    // Создаем кнопки для каждой сложности
    for (const [difficulty, label] of Object.entries(difficulties)) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'difficulty-btn';
        button.textContent = label;

        // Подсвечиваем активную кнопку
        if (difficulty === value) {
            button.classList.add('active');
        }

        // Обработчик клика
        button.addEventListener('click', () => {
            // Убираем активный класс у всех кнопок
            container.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Добавляем активный класс к нажатой кнопке
            button.classList.add('active');

            // Обновляем значение свойства
            currentProperties[propId] = difficulty;
        });

        container.appendChild(button);
    }

    return container;
}

function createGamemodeButtons(propId, value) {
    const container = document.createElement('div');
    container.className = 'gamemode-buttons';

    // Создаем кнопки для каждого режима игры
    for (const [gamemode, label] of Object.entries(gamemodes)) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'gamemode-btn';
        button.textContent = label;

        // Подсвечиваем активную кнопку
        if (gamemode === value) {
            button.classList.add('active');
        }

        // Обработчик клика
        button.addEventListener('click', () => {
            // Убираем активный класс у всех кнопок
            container.querySelectorAll('.gamemode-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Добавляем активный класс к нажатой кнопке
            button.classList.add('active');

            // Обновляем значение свойства
            currentProperties[propId] = gamemode;
        });

        container.appendChild(button);
    }

    return container;
}

function createNumberControl(propId, value) {
    const input = document.createElement('input');
    input.type = 'number';
    input.value = value;

    // Устанавливаем ограничения для определенных свойств
    const constraints = {
        'max-players': { min: 1, max: 1000 },
        'server-port': { min: 1, max: 65535 },
        'view-distance': { min: 1, max: 32 },
        'simulation-distance': { min: 1, max: 32 },
        'spawn-protection': { min: 0, max: 10000 },
        'rcon.port': { min: 1, max: 65535 }
    };

    if (constraints[propId]) {
        input.min = constraints[propId].min;
        input.max = constraints[propId].max;
    }

    input.addEventListener('change', (e) => {
        currentProperties[propId] = parseInt(e.target.value) || 0;
    });

    return input;
}

function createTextControl(propId, value) {
    const input = document.createElement('input');

    // Определяем тип поля
    if (propId === 'rcon.password') {
        input.type = 'password';
    } else {
        input.type = 'text';
    }

    input.value = value;

    // Устанавливаем плейсхолдеры для определенных свойств
    const placeholders = {
        'motd': 'Описание вашего сервера',
        'level-seed': 'Сид для генерации мира',
        'rcon.password': 'Пароль для RCON доступа'
    };

    if (placeholders[propId]) {
        input.placeholder = placeholders[propId];
    }

    input.addEventListener('input', (e) => {
        currentProperties[propId] = e.target.value;
    });

    return input;
}

function updateStatus(message) {
    document.getElementById('statusMessage').textContent = message;
}