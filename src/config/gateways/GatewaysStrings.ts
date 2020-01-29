
{
    function declareGatewaysTranslateResources(pipTranslateProvider: pip.services.ITranslateProvider) {
        pipTranslateProvider.translations('en', {
            GATEWAYS: 'Gateways',
            GATEWAYS_MODEL_LABEL: 'Model',
            GATEWAYS_SEARCH_PLACEHOLDER: 'Search gateways...',
            GATEWAYS_EMPTY_TITLE: 'Gateways not found',
            GATEWAYS_EMPTY_ADD_BUTTON: 'Add gateway',
            GATEWAYS_LOADING_TITLE: 'Loading gateways',
            GATEWAYS_NEW_DESCRIPTION: 'New gateway',
            GATEWAYS_DETAILS: 'Gateway',
            GATEWAYS_DETAILS_NEW: 'New gateway',
            GATEWAYS_DETAILS_EDIT: 'Edit gateway',
            GATEWAYS_SAVE: 'Save',
            GATEWAYS_CANCEL: 'Cancel',
            GATEWAYS_EDIT: 'Edit',
            GATEWAYS_DELETE: 'Delete',
            GATEWAYS_DELETE_CONFIRMATION_TITLE: 'Delete the gateway',

            GATEWAYS_ID: 'System identifier',
            GATEWAYS_IDENTIFICATOR_LABEL: 'Unique device identificator',
            GATEWAY_REGISTER_TIME_HINT: 'Registered',
            GATEWAY_MAC_LABEL: 'MAC-addess',
            GATEWAY_MAC_HINT: 'Specified on the back of the device',

            GATEWAYS_INIT_TIME: 'Init date',
            GATEWAY_MAC_REQUIRED_ERROR: 'Enter the MAC-address',
            GATEWAY_MAC_NOTVALID_ERROR: 'The entered value is not a MAC-address',
            GATEWAYS_ACTIVE_LABEL: 'Status',
            GATEWAYS_ACTIVE: 'Active',
            GATEWAYS_INACTIVE: 'Inactive',

            GATEWAYS_LABEL: 'Label',
            GATEWAY_MAC_NOT_UNIQUE: 'MAC-address already exists',
            GATEWAYS_PING: 'Ping',
            GATEWAY_TAB_INFORMATION: 'Information',
            GATEWAY_TAB_STATISTIC: 'Statistics',

            GATEWAY_INIT_TIME_LABEL: 'Initialization time',
            GATEWAY_UP_TIME_LABEL: 'Up time',
            GATEWAY_UP_PACKETS_LABEL: 'Up packets',
            GATEWAY_UP_ERRORS_LABEL: 'Up errors',
            GATEWAY_DOWN_TIME_LABEL: 'Down time',
            GATEWAY_DOWN_PACKETS_LABEL: 'Down packets',
            GATEWAY_DOWN_ERRORS_LABEL: 'Down errors',
            GATEWAY_STATISTICS_DEVICES_LABEL: 'Statistics on connected trackers',
            GATEWAY_STATISTICS_TIME_LABEL: 'Statistics on the gateway, for',
            GATEWAYS_STATISTICS_EMPTY_TITLE: 'Statistics of the gateway not found',
            GATEWAYS_STATISTICS_LOADING_TITLE: 'The gateway statistics are loaded'

        });
        pipTranslateProvider.translations('ru', {
            GATEWAYS: 'Маршрутизаторы',
            GATEWAYS_MODEL_LABEL: 'Модель',
            GATEWAYS_SEARCH_PLACEHOLDER: 'Найти маршрутизатор...',
            GATEWAYS_EMPTY_TITLE: 'Зарегистрированные маршрутизаторы не найдены',
            GATEWAYS_EMPTY_ADD_BUTTON: 'Добавить маршрутизатор',
            GATEWAYS_LOADING_TITLE: 'Загружаются маршрутизаторы',
            GATEWAYS_NEW_DESCRIPTION: 'Новый маршрутизатор',
            GATEWAYS_DETAILS: 'Маршрутизатор',
            GATEWAYS_DETAILS_NEW: 'Новый маршрутизатор',
            GATEWAYS_DETAILS_EDIT: 'Редактирование маршрутизатора',
            GATEWAYS_SAVE: 'Сохранить',
            GATEWAYS_CANCEL: 'Отменить',
            GATEWAYS_EDIT: 'Изменить',
            GATEWAYS_DELETE: 'Удалить',
            GATEWAYS_DELETE_CONFIRMATION_TITLE: 'Удалить маршрутизатор',

            GATEWAYS_ID: 'Системный идентификатор',
            GATEWAYS_IDENTIFICATOR_LABEL: 'Уникальный идентификатор устройства',
            GATEWAY_REGISTER_TIME_HINT: 'Зарегистрирован',
            GATEWAY_MAC_LABEL: 'MAC-адрес',
            GATEWAY_MAC_HINT: 'Указан на тыльной стороне устройства',

            GATEWAYS_INIT_TIME: 'Дата активации',
            GATEWAY_MAC_REQUIRED_ERROR: 'Введите MAC-адрес',
            GATEWAY_MAC_NOTVALID_ERROR: 'Введенное значение не является MAC-адресом',
            GATEWAYS_ACTIVE_LABEL: 'Рабочий статус',
            GATEWAYS_ACTIVE: 'Включен',
            GATEWAYS_INACTIVE: 'Отключен',

            GATEWAYS_LABEL: 'Метка',
            GATEWAY_MAC_NOT_UNIQUE: 'Введеный MAC-адрес уже существует.',

            GATEWAYS_PING: 'Проверка связи',
            GATEWAY_TAB_INFORMATION: 'Информация',
            GATEWAY_TAB_STATISTIC: 'Статистика',

            GATEWAY_INIT_TIME_LABEL: 'Дата инициализации',
            GATEWAY_UP_TIME_LABEL: 'Время последнего сообщения на сервер',
            GATEWAY_UP_PACKETS_LABEL: 'Количество пакетов на сервер',
            GATEWAY_UP_ERRORS_LABEL: 'Количество ошибок передачи на сервер',
            GATEWAY_DOWN_TIME_LABEL: 'Время последнего сообщения с сервера',
            GATEWAY_DOWN_PACKETS_LABEL: 'Количество пакетов с сервера',
            GATEWAY_DOWN_ERRORS_LABEL: 'Количество ошибок передачи с сервера',
            GATEWAY_STATISTICS_DEVICES_LABEL: 'Статистика по подсоединенным трекерам',
            GATEWAY_STATISTICS_TIME_LABEL: 'Статистика по маршрузизатору, за ',
            GATEWAYS_STATISTICS_EMPTY_TITLE: 'Статистика работы маршрутизатора не найдена',
            GATEWAYS_STATISTICS_LOADING_TITLE: 'Загружается статистика работы маршрутизатора'
        });
    }

    angular
        .module('iqsConfigGateways')
        .config(declareGatewaysTranslateResources);
}
