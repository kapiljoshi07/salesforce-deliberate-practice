public with sharing class TriggerDispatcher {
    public static void dispatchTrigger(TriggerInterface triggerHandler) {
        triggerHandler.invokeTrigger();
    }
}