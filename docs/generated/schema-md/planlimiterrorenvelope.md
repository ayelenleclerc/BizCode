# PlanLimitErrorEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PlanLimitErrorEnvelope.schema.json](../schema-json/PlanLimitErrorEnvelope.schema.json "open original schema") |

## PlanLimitErrorEnvelope Type

`object` ([PlanLimitErrorEnvelope](planlimiterrorenvelope.md))

# PlanLimitErrorEnvelope Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                     |
| :-------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [currentPlan](#currentplan) | `string`  | Optional | cannot be null | [PlanLimitErrorEnvelope](planlimiterrorenvelope-properties-currentplan.md "undefined#/properties/currentPlan") |
| [error](#error)             | `string`  | Required | cannot be null | [PlanLimitErrorEnvelope](planlimiterrorenvelope-properties-error.md "undefined#/properties/error")             |
| [feature](#feature)         | `string`  | Optional | cannot be null | [PlanLimitErrorEnvelope](planlimiterrorenvelope-properties-feature.md "undefined#/properties/feature")         |
| [success](#success)         | `boolean` | Required | cannot be null | [PlanLimitErrorEnvelope](planlimiterrorenvelope-properties-success.md "undefined#/properties/success")         |

## currentPlan



`currentPlan`

* is optional

* Type: `string`

* cannot be null

* defined in: [PlanLimitErrorEnvelope](planlimiterrorenvelope-properties-currentplan.md "undefined#/properties/currentPlan")

### currentPlan Type

`string`

## error



`error`

* is required

* Type: `string`

* cannot be null

* defined in: [PlanLimitErrorEnvelope](planlimiterrorenvelope-properties-error.md "undefined#/properties/error")

### error Type

`string`

### error Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                     | Explanation |
| :------------------------ | :---------- |
| `"plan_limit_users"`      |             |
| `"plan_limit_invoices"`   |             |
| `"plan_feature_required"` |             |

## feature



`feature`

* is optional

* Type: `string`

* cannot be null

* defined in: [PlanLimitErrorEnvelope](planlimiterrorenvelope-properties-feature.md "undefined#/properties/feature")

### feature Type

`string`

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PlanLimitErrorEnvelope](planlimiterrorenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
false
```
