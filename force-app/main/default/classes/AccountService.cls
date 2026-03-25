public with sharing class AccountService {
    
    public static void runBeforeInsert(List<Account> lstNewAccounts) {
        System.debug('Before Insert Logic: ');
        System.debug('lstNewAccounts: '+lstNewAccounts);
    }

    public static void runBeforeUpdate(List<Account> lstOldAccounts, Map<Id, Account> mapOldAccounts, 
                                        List<Account> lstNewAccounts, Map<Id, Account> mapNewAccounts) {
        System.debug('Before Update Logic');
        System.debug('lstOldAccounts: '+lstOldAccounts);
        System.debug('mapOldAccounts: '+mapOldAccounts);
        System.debug('lstNewAccounts: '+lstNewAccounts);
        System.debug('mapNewAccounts: '+mapNewAccounts);
    }

    public static void runBeforeDelete(List<Account> lstOldAccounts, Map<Id, Account> mapOldAccounts) {
        System.debug('Before Delete Logic');
        System.debug('lstOldAccounts: '+lstOldAccounts);
        System.debug('mapOldAccounts: '+mapOldAccounts);
    }

    public static void runAfterInsert(List<Account> lstNewAccounts, Map<Id, Account> mapNewAccounts) {
        System.debug('After Insert Logic');
        System.debug('lstNewAccounts: '+lstNewAccounts);
        System.debug('mapNewAccounts: '+mapNewAccounts);
    }

    public static void runAfterUpdate(List<Account> lstOldAccounts, Map<Id, Account> mapOldAccounts, 
                                        List<Account> lstNewAccounts, Map<Id, Account> mapNewAccounts) {
        System.debug('After Update Logic');
        System.debug('lstOldAccounts: '+lstOldAccounts);
        System.debug('mapOldAccounts: '+mapOldAccounts);
        System.debug('lstNewAccounts: '+lstNewAccounts);
        System.debug('mapNewAccounts: '+mapNewAccounts);
    }

    public static void runAfterDelete(List<Account> lstOldAccounts, Map<Id, Account> mapOldAccounts) {
        System.debug('After Delete Logic');
        System.debug('lstOldAccounts: '+lstOldAccounts);
        System.debug('mapOldAccounts: '+mapOldAccounts);
    }

    public static void runAfterUndelete(List<Account> lstNewAccounts, Map<Id, Account> mapNewAccounts) {
        System.debug('After Undelete Logic');
        System.debug('lstNewAccounts: '+lstNewAccounts);
        System.debug('mapNewAccounts: '+mapNewAccounts);
    }
}