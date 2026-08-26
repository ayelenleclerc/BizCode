# FacturaAnomalyWarning Schema

```txt
undefined#/properties/warnings/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaEnvelope.schema.json\*](../schema-json/FacturaEnvelope.schema.json "open original schema") |

## items Type

`object` ([FacturaAnomalyWarning](facturaanomalywarning.md))

# items Properties

| Property                    | Type     | Required | Nullable       | Defined by                                                                                                   |
| :-------------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [descripcion](#descripcion) | `string` | Required | cannot be null | [FacturaAnomalyWarning](facturaanomalywarning-properties-descripcion.md "undefined#/properties/descripcion") |
| [detalle](#detalle)         | `object` | Optional | cannot be null | [FacturaAnomalyWarning](facturaanomalywarning-properties-detalle.md "undefined#/properties/detalle")         |
| [severidad](#severidad)     | `string` | Required | cannot be null | [FacturaAnomalyWarning](facturaanomalywarning-properties-severidad.md "undefined#/properties/severidad")     |
| [tipo](#tipo)               | `string` | Required | cannot be null | [FacturaAnomalyWarning](facturaanomalywarning-properties-tipo.md "undefined#/properties/tipo")               |

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaAnomalyWarning](facturaanomalywarning-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## detalle



`detalle`

* is optional

* Type: `object` ([Details](facturaanomalywarning-properties-detalle.md))

* cannot be null

* defined in: [FacturaAnomalyWarning](facturaanomalywarning-properties-detalle.md "undefined#/properties/detalle")

### detalle Type

`object` ([Details](facturaanomalywarning-properties-detalle.md))

## severidad



`severidad`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaAnomalyWarning](facturaanomalywarning-properties-severidad.md "undefined#/properties/severidad")

### severidad Type

`string`

### severidad Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"warning"`  |             |
| `"critical"` |             |

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaAnomalyWarning](facturaanomalywarning-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                           | Explanation |
| :------------------------------ | :---------- |
| `"factura_duplicada"`           |             |
| `"monto_inusual"`               |             |
| `"descuento_excesivo"`          |             |
| `"cliente_nuevo_compra_grande"` |             |
