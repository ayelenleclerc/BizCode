# ConciliarManualBody Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConciliarManualBody.schema.json](../schema-json/ConciliarManualBody.schema.json "open original schema") |

## ConciliarManualBody Type

`object` ([ConciliarManualBody](conciliarmanualbody.md))

# ConciliarManualBody Properties

| Property      | Type      | Required | Nullable       | Defined by                                                                                 |
| :------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [id](#id)     | `integer` | Required | cannot be null | [ConciliarManualBody](conciliarmanualbody-properties-id.md "undefined#/properties/id")     |
| [tipo](#tipo) | `string`  | Required | cannot be null | [ConciliarManualBody](conciliarmanualbody-properties-tipo.md "undefined#/properties/tipo") |

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConciliarManualBody](conciliarmanualbody-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [ConciliarManualBody](conciliarmanualbody-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value            | Explanation |
| :--------------- | :---------- |
| `"recibo_forma"` |             |
| `"cobro"`        |             |
