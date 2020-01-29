{
    function declarePingTranslateResources(pipTranslateProvider: pip.services.ITranslateProvider) {
        pipTranslateProvider.translations('en', {
            PING_DEFAULT_DIALOG_TITLE: 'Ping',
            PING_DEFAULT_BUTTON_OK: 'Ok',
            PING_DEFAULT_PROCESS_LABEL: 'Pinging, please wait',
            PING_DEFAULT_SUCCESS_LABEL: 'Ping was success',
            PING_DEFAULT_FAILED_LABEL: 'Ping failed',
            PING_DIALOG_ABORT: 'Abort',
            PING_DIALOG_OK: 'Ok',
            PING_DIALOG_CLOSE: 'Close',
            PING_DEVICE_INACTIVE_ERROR: 'Device inactive',
            PING_UNKNOWN_ERROR: 'Unknown error'

        });
        pipTranslateProvider.translations('ru', {
            PING_DEFAULT_DIALOG_TITLE: 'Проверка связи',
            PING_DEFAULT_BUTTON_OK: 'Ok',
            PING_DEFAULT_PROCESS_LABEL: 'Проверка связи, подождите пожалуйста',
            PING_DEFAULT_SUCCESS_LABEL: 'Проверка связи завершена успешно',
            PING_DEFAULT_FAILED_LABEL: 'Нет связи с устройством',
            PING_DIALOG_ABORT: 'Прервать',
            PING_DIALOG_OK: 'Ok',
            PING_DIALOG_CLOSE: 'Закрыть',
            PING_DEVICE_INACTIVE_ERROR: 'Устройство отключено',
            PING_UNKNOWN_ERROR: 'Неизвестная ошибка'
        });
    }

    angular
        .module('iqsPingDialog')
        .config(declarePingTranslateResources);
}
