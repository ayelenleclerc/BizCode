# Untitled object in ContratoUpdateInput Schema

```txt
undefined#/allOf/1
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ContratoUpdateInput.schema.json\*](../schema-json/ContratoUpdateInput.schema.json "open original schema") |

## 1 Type

`object` ([Details](contratoupdateinput-allof-1.md))

# 1 Properties

| Property          | Type     | Required | Nullable       | Defined by                                                                      |
| :---------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------ |
| [estado](#estado) | `string` | Optional | cannot be null | [ContratoUpdateInput](contratoestado.md "undefined#/allOf/1/properties/estado") |

## estado



`estado`

* is optional

* Type: `string` ([ContratoEstado](contratoestado.md))

* cannot be null

* defined in: [ContratoUpdateInput](contratoestado.md "undefined#/allOf/1/properties/estado")

### estado Type

`string` ([ContratoEstado](contratoestado.md))

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"activo"`     |             |
| `"pausado"`    |             |
| `"finalizado"` |             |
| `"cancelado"`  |             |
