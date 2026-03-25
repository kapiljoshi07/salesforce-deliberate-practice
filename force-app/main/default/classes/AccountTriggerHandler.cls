public with sharing class AccountTriggerHandler extends TriggerOperation {
    
    public override void invokeTrigger() {

        if (isBefore && isInsert) handleBeforeInsert(lstNewRecords);

        if (isBefore && isUpdate) handleBeforeUpdate(lstOldRecords, mapOldRecords, lstNewRecords, mapNewRecords);
        
        if (isBefore && isDelete) handleBeforeDelete(lstOldRecords, mapOldRecords);
        
        if (isAfter && isInsert) handleAfterInsert(lstNewRecords, mapNewRecords);
        
        if (isAfter && isUpdate) handleAfterUpdate(lstOldRecords, mapOldRecords, lstNewRecords, mapNewRecords);
        
        if (isAfter && isDelete) handleAfterDelete(lstOldRecords, mapOldRecords);
        
        if (isAfter && isUndelete) handleAfterUndelete(lstNewRecords, mapNewRecords);
        
    }

    private void handleBeforeInsert(List<SObject> newRecords) {
        AccountService.runBeforeInsert((List<Account>)newRecords);
    }

    private void handleBeforeUpdate(List<SObject> oldRecords, Map<Id, SObject> oldMap, 
                                    List<SObject> newRecords, Map<Id, SObject> newMap) {
        AccountService.runBeforeUpdate((List<Account>)oldRecords, (Map<Id, Account>)oldMap, 
                                        (List<Account>)newRecords, (Map<Id, Account>)newMap);
    }

    private void handleBeforeDelete(List<SObject> oldRecords, Map<Id, SObject> oldMap) {
        AccountService.runBeforeDelete((List<Account>)oldRecords, (Map<Id, Account>)oldMap);
    }

    private void handleAfterInsert(List<SObject> newRecords, Map<Id, SObject> newMap) {
        AccountService.runAfterInsert((List<Account>)newRecords, (Map<Id, Account>)newMap);
    }

    private void handleAfterUpdate(List<SObject> oldRecords, Map<Id, SObject> oldMap, 
                                    List<SObject> newRecords, Map<Id, SObject> newMap) {
        AccountService.runAfterUpdate((List<Account>)oldRecords, (Map<Id, Account>)oldMap, 
                                        (List<Account>)newRecords, (Map<Id, Account>)newMap);
    }

    private void handleAfterDelete(List<SObject> oldRecords, Map<Id, SObject> oldMap) {
        AccountService.runAfterDelete((List<Account>)oldRecords, (Map<Id, Account>)oldMap);
    }

    private void handleAfterUndelete(List<SObject> newRecords, Map<Id, SObject> newMap) {
        AccountService.runAfterUndelete((List<Account>)newRecords, (Map<Id, Account>)newMap);
    }
}