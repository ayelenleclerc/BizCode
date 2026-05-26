# Untitled string in OrdenEntrega Schema

```txt
undefined#/properties/dispatchTimestampSource
```

How dispatchedAt was derived (audit event vs estimated from updatedAt).

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                   |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [OrdenEntrega.schema.json\*](../schema-json/OrdenEntrega.schema.json "open original schema") |

## dispatchTimestampSource Type

`string`

## dispatchTimestampSource Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"event"`     |             |
| `"estimated"` |             |
