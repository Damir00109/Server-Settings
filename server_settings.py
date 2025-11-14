import eel
import os
import sys
import argparse
from pathlib import Path

# Инициализация Eel
eel.init('web')


class PropertiesManager:
    def __init__(self, server_path):
        # Преобразуем относительный путь в абсолютный
        self.server_path = os.path.abspath(server_path)
        self.properties_file = Path(self.server_path) / "server.properties"
        self.default_properties = {
            'accepts-transfers': False,
            'allow-flight': False,
            'allow-nether': True,
            'broadcast-console-to-ops': True,
            'broadcast-rcon-to-ops': True,
            'bug-report-link': '',
            'difficulty': 'easy',
            'enable-command-block': False,
            'enable-jmx-monitoring': False,
            'enable-query': False,
            'enable-rcon': False,
            'enable-status': True,
            'enforce-secure-profile': False,
            'enforce-whitelist': False,
            'entity-broadcast-range-percentage': 100,
            'force-gamemode': False,
            'function-permission-level': 2,
            'gamemode': 'survival',
            'generate-structures': True,
            'generator-settings': '{}',
            'hardcore': False,
            'hide-online-players': False,
            'initial-disabled-packs': '',
            'initial-enabled-packs': 'vanilla',
            'level-name': 'world',
            'level-seed': '',
            'level-type': 'minecraft:normal',
            'log-ips': True,
            'max-chained-neighbor-updates': 1000000,
            'max-players': 20,
            'max-tick-time': 60000,
            'max-world-size': 29999984,
            'motd': 'A Minecraft Server',
            'network-compression-threshold': 256,
            'online-mode': True,
            'op-permission-level': 4,
            'player-idle-timeout': 0,
            'prevent-proxy-connections': False,
            'pvp': True,
            'query.port': 25565,
            'rate-limit': 0,
            'rcon.password': '',
            'rcon.port': 25575,
            'region-file-compression': 'deflate',
            'require-resource-pack': False,
            'resource-pack': '',
            'resource-pack-id': '',
            'resource-pack-prompt': '',
            'resource-pack-sha1': '',
            'server-ip': '',
            'server-port': 25565,
            'simulation-distance': 10,
            'spawn-animals': True,
            'spawn-monsters': True,
            'spawn-npcs': True,
            'spawn-protection': 16,
            'sync-chunk-writes': True,
            'text-filtering-config': '',
            'use-native-transport': True,
            'view-distance': 10,
            'white-list': False
        }

    def get_server_info(self):
        """Возвращает информацию о сервере"""
        return {
            'server_path': str(self.server_path),
            'properties_file': str(self.properties_file),
            'exists': self.properties_file.exists()
        }

    def parse_properties(self, content):
        """Парсит содержимое server.properties"""
        properties = {}
        for line in content.split('\n'):
            line = line.strip()
            if line and '=' in line and not line.startswith('#'):
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()

                # Преобразование типов
                if value.lower() in ['true', 'false']:
                    properties[key] = value.lower() == 'true'
                elif value.isdigit() or (value.startswith('-') and value[1:].isdigit()):
                    properties[key] = int(value)
                else:
                    properties[key] = value
        return properties

    def generate_properties_content(self, properties):
        """Генерирует содержимое для server.properties"""
        lines = []
        for key, value in properties.items():
            if isinstance(value, bool):
                lines.append(f"{key}={str(value).lower()}")
            else:
                lines.append(f"{key}={value}")
        return '\n'.join(lines)

    def load_properties(self):
        """Загружает свойства из файла"""
        try:
            if self.properties_file.exists():
                with open(self.properties_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                return {
                    'success': True,
                    'properties': self.parse_properties(content)
                }
            else:
                # Если файла нет, создаём с настройками по умолчанию
                return {
                    'success': True,
                    'properties': self.default_properties.copy()
                }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def save_properties(self, properties):
        """Сохраняет свойства в файл"""
        try:
            # Создаём директорию если её нет
            self.properties_file.parent.mkdir(parents=True, exist_ok=True)

            content = self.generate_properties_content(properties)
            with open(self.properties_file, 'w', encoding='utf-8') as f:
                f.write(content)
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}


# Глобальная переменная для менеджера свойств
properties_manager = None


# Eel функции
@eel.expose
def get_server_info():
    """Возвращает информацию о сервере"""
    return properties_manager.get_server_info()


@eel.expose
def get_default_properties():
    """Возвращает свойства по умолчанию"""
    return properties_manager.default_properties


@eel.expose
def load_properties():
    """Загружает свойства из файла"""
    return properties_manager.load_properties()


@eel.expose
def save_properties(properties):
    """Сохраняет свойства в файл"""
    return properties_manager.save_properties(properties)


def main():
    global properties_manager

    # Парсинг аргументов командной строки
    parser = argparse.ArgumentParser(description='Minecraft Server Properties Editor')
    parser.add_argument('-path', '--path', required=True, help='Путь к папке сервера Minecraft')

    args = parser.parse_args()

    # Проверяем существование пути (преобразуем в абсолютный)
    server_path = os.path.abspath(args.path)
    if not os.path.exists(server_path):
        print(f"Ошибка: Путь '{server_path}' не существует!")
        sys.exit(1)

    # Инициализируем менеджер свойств
    properties_manager = PropertiesManager(server_path)

    print(f"Запуск редактора свойств Minecraft...")
    print(f"Путь к серверу: {server_path}")

    # Запускаем приложение
    eel.start('index.html', size=(1000, 800), position=(100, 100))


if __name__ == '__main__':
    main()