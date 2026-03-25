public with sharing abstract class TriggerOperation implements TriggerInterface {
    
    protected Boolean isInsert = Trigger.isInsert;
    protected Boolean isUpdate = Trigger.isUpdate;
    protected Boolean isDelete = Trigger.isDelete;
    protected Boolean isUndelete = Trigger.isUndelete;
    protected Boolean isBefore = Trigger.isBefore;
    protected Boolean isAfter = Trigger.isAfter;
    protected Boolean isExecuting = Trigger.isExecuting;
    protected Integer size = Trigger.size;
    protected List<SObject> lstNewRecords  = Trigger.new;
    protected List<SObject> lstOldRecords = Trigger.old;
    protected Map<Id, SObject> mapNewRecords = Trigger.newMap;
    protected Map<Id, SObject> mapOldRecords = Trigger.oldMap;
    protected abstract void invokeTrigger();
    
}