# CoberturaOSUpsertInput Schema

```txt
undefined#/properties/coberturas/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ObraSocialCreateInput.schema.json\*](../schema-json/ObraSocialCreateInput.schema.json "open original schema") |

## items Type

`object` ([CoberturaOSUpsertInput](coberturaosupsertinput.md))

# items Properties

| Property                      | Type     | Required | Nullable       | Defined by                                                                                                 |
| :---------------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [cobertura](#cobertura)       | `number` | Required | cannot be null | [CoberturaOSUpsertInput](coberturaosupsertinput-properties-cobertura.md "undefined#/properties/cobertura") |
| [tipoProducto](#tipoproducto) | `string` | Required | cannot be null | [CoberturaOSUpsertInput](ostipoproducto.md "undefined#/properties/tipoProducto")                           |

## cobertura



`cobertura`

* is required

* Type: `number`

* cannot be null

* defined in: [CoberturaOSUpsertInput](coberturaosupsertinput-properties-cobertura.md "undefined#/properties/cobertura")

### cobertura Type

`number`

### cobertura Constraints

**maximum**: the value of this number must smaller than or equal to: `100`

**minimum**: the value of this number must greater than or equal to: `0`

## tipoProducto



`tipoProducto`

* is required

* Type: `string` ([OsTipoProducto](ostipoproducto.md))

* cannot be null

* defined in: [CoberturaOSUpsertInput](ostipoproducto.md "undefined#/properties/tipoProducto")

### tipoProducto Type

`string` ([OsTipoProducto](ostipoproducto.md))

### tipoProducto Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"generico"`   |             |
| `"marca"`      |             |
| `"cronico"`    |             |
| `"oncologico"` |             |
