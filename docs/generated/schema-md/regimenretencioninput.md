# RegimenRetencionInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RegimenRetencionInput.schema.json](../schema-json/RegimenRetencionInput.schema.json "open original schema") |

## RegimenRetencionInput Type

`object` ([RegimenRetencionInput](regimenretencioninput.md))

# RegimenRetencionInput Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                   |
| :-------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [activo](#activo)           | `boolean` | Optional | cannot be null | [RegimenRetencionInput](regimenretencioninput-properties-activo.md "undefined#/properties/activo")           |
| [alicuota](#alicuota)       | `number`  | Required | cannot be null | [RegimenRetencionInput](regimenretencioninput-properties-alicuota.md "undefined#/properties/alicuota")       |
| [alicuotaMin](#alicuotamin) | `number`  | Optional | can be null    | [RegimenRetencionInput](regimenretencioninput-properties-alicuotamin.md "undefined#/properties/alicuotaMin") |
| [nombre](#nombre)           | `string`  | Required | cannot be null | [RegimenRetencionInput](regimenretencioninput-properties-nombre.md "undefined#/properties/nombre")           |
| [provincia](#provincia)     | `string`  | Optional | can be null    | [RegimenRetencionInput](regimenretencioninput-properties-provincia.md "undefined#/properties/provincia")     |
| [subtipo](#subtipo)         | `string`  | Required | cannot be null | [RegimenRetencionInput](regimenretencioninput-properties-subtipo.md "undefined#/properties/subtipo")         |
| [tipo](#tipo)               | `string`  | Required | cannot be null | [RegimenRetencionInput](regimenretencioninput-properties-tipo.md "undefined#/properties/tipo")               |

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [RegimenRetencionInput](regimenretencioninput-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## alicuota



`alicuota`

* is required

* Type: `number`

* cannot be null

* defined in: [RegimenRetencionInput](regimenretencioninput-properties-alicuota.md "undefined#/properties/alicuota")

### alicuota Type

`number`

### alicuota Constraints

**maximum**: the value of this number must smaller than or equal to: `100`

**minimum**: the value of this number must greater than or equal to: `0`

## alicuotaMin



`alicuotaMin`

* is optional

* Type: `number`

* can be null

* defined in: [RegimenRetencionInput](regimenretencioninput-properties-alicuotamin.md "undefined#/properties/alicuotaMin")

### alicuotaMin Type

`number`

### alicuotaMin Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [RegimenRetencionInput](regimenretencioninput-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `80`

**minimum length**: the minimum number of characters for this string is: `1`

## provincia



`provincia`

* is optional

* Type: `string`

* can be null

* defined in: [RegimenRetencionInput](regimenretencioninput-properties-provincia.md "undefined#/properties/provincia")

### provincia Type

`string`

### provincia Constraints

**maximum length**: the maximum number of characters for this string is: `10`

## subtipo



`subtipo`

* is required

* Type: `string`

* cannot be null

* defined in: [RegimenRetencionInput](regimenretencioninput-properties-subtipo.md "undefined#/properties/subtipo")

### subtipo Type

`string`

### subtipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"retencion"`  |             |
| `"percepcion"` |             |

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [RegimenRetencionInput](regimenretencioninput-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"ganancias"` |             |
| `"iva"`       |             |
| `"iibb"`      |             |
