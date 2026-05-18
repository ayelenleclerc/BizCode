# CobranzaRecordatorioInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CobranzaRecordatorioInput.schema.json](../schema-json/CobranzaRecordatorioInput.schema.json "open original schema") |

## CobranzaRecordatorioInput Type

`object` ([CobranzaRecordatorioInput](cobranzarecordatorioinput.md))

# CobranzaRecordatorioInput Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                                                       |
| :---------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [canal](#canal)         | `string`  | Optional | cannot be null | [CobranzaRecordatorioInput](cobranzarecordatorioinput-properties-canal.md "undefined#/properties/canal")         |
| [facturaId](#facturaid) | `integer` | Required | cannot be null | [CobranzaRecordatorioInput](cobranzarecordatorioinput-properties-facturaid.md "undefined#/properties/facturaId") |

## canal



`canal`

* is optional

* Type: `string`

* cannot be null

* defined in: [CobranzaRecordatorioInput](cobranzarecordatorioinput-properties-canal.md "undefined#/properties/canal")

### canal Type

`string`

### canal Constraints

**maximum length**: the maximum number of characters for this string is: `20`

### canal Default Value

The default value is:

```json
"email"
```

## facturaId



`facturaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [CobranzaRecordatorioInput](cobranzarecordatorioinput-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

### facturaId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
