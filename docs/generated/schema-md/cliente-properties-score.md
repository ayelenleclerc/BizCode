# Untitled integer in Cliente Schema

```txt
undefined#/properties/score
```

Payment score 0-100 (50=neutral, 0=high risk, 100=perfect).

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                         |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [Cliente.schema.json\*](../schema-json/Cliente.schema.json "open original schema") |

## score Type

`integer`

## score Constraints

**maximum**: the value of this number must smaller than or equal to: `100`

**minimum**: the value of this number must greater than or equal to: `0`

## score Default Value

The default value is:

```json
50
```
