# Untitled string in PlanLimitErrorEnvelope Schema

```txt
undefined#/properties/error
```



| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [PlanLimitErrorEnvelope.schema.json\*](../schema-json/PlanLimitErrorEnvelope.schema.json "open original schema") |

## error Type

`string`

## error Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                     | Explanation |
| :------------------------ | :---------- |
| `"plan_limit_users"`      |             |
| `"plan_limit_invoices"`   |             |
| `"plan_feature_required"` |             |
