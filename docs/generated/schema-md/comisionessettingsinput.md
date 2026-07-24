# ComisionesSettingsInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ComisionesSettingsInput.schema.json](../schema-json/ComisionesSettingsInput.schema.json "open original schema") |

## ComisionesSettingsInput Type

`object` ([ComisionesSettingsInput](comisionessettingsinput.md))

# ComisionesSettingsInput Properties

| Property                    | Type     | Required | Nullable       | Defined by                                                                     |
| :-------------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------- |
| [modoDevengo](#mododevengo) | `string` | Required | cannot be null | [ComisionesSettingsInput](comisiontipo.md "undefined#/properties/modoDevengo") |

## modoDevengo



`modoDevengo`

* is required

* Type: `string` ([ComisionTipo](comisiontipo.md))

* cannot be null

* defined in: [ComisionesSettingsInput](comisiontipo.md "undefined#/properties/modoDevengo")

### modoDevengo Type

`string` ([ComisionTipo](comisiontipo.md))

### modoDevengo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                      | Explanation |
| :------------------------- | :---------- |
| `"porcentaje_cobrado"`     |             |
| `"porcentaje_facturado"`   |             |
| `"importe_fijo_por_venta"` |             |
