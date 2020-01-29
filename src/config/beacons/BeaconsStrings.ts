{

    function configureConfigBeaconsTranslations(
        pipTranslateProvider: pip.services.ITranslateProvider
    ) {
        pipTranslateProvider.translations('en', {
            BEACON_NAME: 'Beacon name',
            BEACON_UDI: 'Unique device identificator',
            BEACON_ID: 'System identifier',
            BEACONS_TITLE: 'Beacons',
            BEACON_EMPTY_TITLE: 'Beacons were not found',
            BEACON_EMPTY_SUBTITLE: 'Lighthouses allow you to position objects inside the premises. They must support the standards of iBeacon or Eddy to work together with smartphones or specialized trackers that have a beacon detection function.',
            BEACON_EMPTY_ADD_BUTTON: 'Add beacon',
            BEACON_LOADING_TITLE: 'Loading beacons...',
            TO_CENTER: 'To the organization center',

            BEACON_NEW_LOCATION: 'New Beacon',
            BEACON_EDIT: 'Edit',
            BEACON_DELETE: 'Delete',
            BEACON_SAVE: 'Save',
            BEACON_DELETE_CONFIRMATION_TITLE: 'Delete the beacon',
            BEACON_DETAILS: 'Beacons',
            BEACON_DETAILS_NEW: 'New beacon',
            BEACON_DETAILS_EDIT: 'Edit beacon',
            BEACON_CANCEL: 'Cancel',
            BEACON_NOT_POSITION: 'The beacon position is not set. Use map to define the position',
            BEACON_ADD_POINT: 'Add point',
            BEACON_LABEL_UNIQUE_ERROR: 'The entered label is already in use',
            BEACON_UDI_UNIQUE_ERROR: 'The entered identifier is already in use',
            BEACON_NO_LABEL: 'No label',
            BEACON_LABEL_LONGITUDE: 'Longitude (deg)',
            BEACON_LABEL_LATTITUDE: 'Latitude (deg)',
            BEACON_LABEL_DISTANSE: 'Radius (m)',
            BEACON_LATTITUDE_REQUIRED_ERROR: 'You must enter the beacon latitude',
            BEACON_LONGITUDE_REQUIRED_ERROR: 'You must enter the beacon longtitude',
            BEACON_UDI_REQUIRED_ERROR: 'You must enter the beacon identifier',
            BEACON_NAME_REQUIRED_ERROR: 'You must enter the beacon name',
            BEACON_TYPE_PLACEHOLDER: 'Select the beacon type',
            BEACON_TYPE_LABEL: 'Beacon type',
            BEACON_TYPE_REQUIRED_ERROR: 'Select the rule type',

            BEACON_PROXIMITYUUID_ERROR: 'Invalid Proximity UUID Format, enter characters (0-9, a-f)',
            BEACON_MAJOR_ERROR: 'Enter characters 0-9',
            BEACON_MINOR_ERROR: 'Enter characters 0-9',
            BEACON_NAMESPACEID_ERROR: 'Invalid Namespace ID Format, enter characters (0-9, a-f)',
            BEACON_INSTANCEID_UDI_ERROR: 'Invalid Instance ID Format, enter characters (0-9, a-f)',
            BEACON_UNKNOWN_UDI_ERROR: 'Invalid UDI Format, enter characters (0-9, a-f)',
            BEACON_PROXIMITYUUID_ERROR_LENGTH: '32 characters (0-9, a-f)', //Invalid MAC Address Format 
            BEACON_MAJOR_ERROR_LENGTH: 'max 5 digit',
            BEACON_MINOR_ERROR_LENGTH: 'max 5 digit',
            BEACON_NAMESPACEID_ERROR_LENGTH: '20 characters (0-9, a-f)',
            BEACON_INSTANCEID_UDI_ERROR_LENGTH: '12 characters (0-9, a-f)',   
            
            BEACON_PROXIMITYUUID: 'Proximity UUID',
            BEACON_MAJOR: 'Major',
            BEACON_MINOR: 'Minor',
            BEACON_NAMESPACEID: 'Namespace Id',
            BEACON_INSTANCEID: 'Instance Id',
            BEACON_UNKNOWN_UDI: 'UDI маяка',

            BEACON_UDI_PROXIMITYUUID_REQUIRED_ERROR: 'Proximity UUID required',
            BEACON_UDI_MAJOR_REQUIRED_ERROR: 'Major required',
            BEACON_UDI_MINOR_REQUIRED_ERROR: 'Minor required',
            BEACON_UDI_NAMESPACEID_REQUIRED_ERROR: 'Namespace Id required',
            BEACON_UDI_INSTANCEID_REQUIRED_ERROR: 'Instance Id required',
        });

        pipTranslateProvider.translations('ru', {
            BEACON_NAME: 'Название маяка',
            BEACON_UDI: 'Уникальный идентификатор устройства',
            BEACON_ID: 'Системный идентификатор',
            BEACONS_TITLE: 'Маяки',
            BEACON_EMPTY_TITLE: 'Маяки не найдены',
            BEACON_EMPTY_SUBTITLE: 'Маяки позволяют позиционировать объекты внутри помещений. Они должны поддерживать стандарты iBeacon или Eddy для совместной работы со смартфонами или специализированными трекерами, имеющими функцию  обнаружения маяков.',
            BEACON_EMPTY_ADD_BUTTON: 'Добавить маяк',
            BEACON_LOADING_TITLE: 'Загрузка маяков...',
            TO_CENTER: 'К центру площадки',

            BEACON_NEW_LOCATION: 'Новый маяк',
            BEACON_EDIT: 'Изменить',
            BEACON_DELETE: 'Удалить',
            BEACON_SAVE: 'Сохранить',
            BEACON_DELETE_CONFIRMATION_TITLE: 'Удалить маяк',
            BEACON_DETAILS: 'Маяки',
            BEACON_DETAILS_NEW: 'Новый маяк',
            BEACON_DETAILS_EDIT: 'Редактирование маяка',
            BEACON_CANCEL: 'Отменить',
            BEACON_NOT_POSITION: 'Позиция маяка не определена. Определите позицию на карте',
            BEACON_ADD_POINT: 'Добавить позицию',
            BEACON_LABEL_UNIQUE_ERROR: 'Введеный маяк уже используется',
            BEACON_UDI_UNIQUE_ERROR: 'Введеный идентификатор уже используется',
            BEACON_NO_LABEL: 'Без метки',
            BEACON_LABEL_LONGITUDE: 'Широта (град)',
            BEACON_LABEL_LATTITUDE: 'Долгота (град)',
            BEACON_LABEL_DISTANSE: 'Радиус (м)',
            BEACON_LATTITUDE_REQUIRED_ERROR: 'Укажите широту местонахождения маяка',
            BEACON_LONGITUDE_REQUIRED_ERROR: 'Укажите долготу местонахождения маяка',
            BEACON_UDI_REQUIRED_ERROR: 'Укажите идентификатор  маяка',
            BEACON_NAME_REQUIRED_ERROR: 'Укажите название маяка',
            BEACON_TYPE_PLACEHOLDER: 'Выберите тип маяка',
            BEACON_TYPE_LABEL: 'Тип маяка',
            BEACON_TYPE_REQUIRED_ERROR: 'Выберите тип маяка',
            
            BEACON_PROXIMITYUUID_ERROR: 'Неправильный формат, разрешены символы  (0-9, a-f)',
            BEACON_MAJOR_ERROR: 'Введите цифры 0-9',
            BEACON_MINOR_ERROR: 'Введите цифры 0-9',
            BEACON_NAMESPACEID_ERROR: 'Неправильный формат, разрешены символы  (0-9, a-f)',
            BEACON_INSTANCEID_UDI_ERROR: 'Неправильный формат, разрешены символы  (0-9, a-f)',
            BEACON_UNKNOWN_UDI_ERROR: 'Неправильный формат, разрешены символы  (0-9, a-f)',
            BEACON_PROXIMITYUUID_ERROR_LENGTH: '32 символа (0-9, a-f)', 
            BEACON_MAJOR_ERROR_LENGTH: 'максимум 5 цифр',
            BEACON_MINOR_ERROR_LENGTH: 'максимум 5 цифр',
            BEACON_NAMESPACEID_ERROR_LENGTH: '20 символа (0-9, a-f)',
            BEACON_INSTANCEID_UDI_ERROR_LENGTH: '12 символа (0-9, a-f)',   
            BEACON_PROXIMITYUUID: 'Proximity UUID',
            BEACON_MAJOR: 'Major',
            BEACON_MINOR: 'Minor',
            BEACON_NAMESPACEID: 'Namespace Id',
            BEACON_INSTANCEID: 'Instance Id',
            BEACON_UNKNOWN_UDI: 'UDI маяка',      

            BEACON_UDI_PROXIMITYUUID_REQUIRED_ERROR: 'Укажите Proximity UUID',
            BEACON_UDI_MAJOR_REQUIRED_ERROR: 'Укажите Major',
            BEACON_UDI_MINOR_REQUIRED_ERROR: 'Укажите Minor',
            BEACON_UDI_NAMESPACEID_REQUIRED_ERROR: 'Укажите Namespace Id',
            BEACON_UDI_INSTANCEID_REQUIRED_ERROR: 'Укажите Instance Id',

        });
    }

    angular
        .module('iqsConfigBeacons')
        .config(configureConfigBeaconsTranslations);

}
