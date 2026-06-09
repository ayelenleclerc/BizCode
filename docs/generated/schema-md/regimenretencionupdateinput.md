# RegimenRetencionUpdateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RegimenRetencionUpdateInput.schema.json](../schema-json/RegimenRetencionUpdateInput.schema.json "open original schema") |

## RegimenRetencionUpdateInput Type

`object` ([RegimenRetencionUpdateInput](regimenretencionupdateinput.md))

# RegimenRetencionUpdateInput Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                               |
| :-------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [activo](#activo)           | `boolean` | Optional | cannot be null | [RegimenRetencionUpdateInput](regimenretencionupdateinput-properties-activo.md "undefined#/properties/activo")           |
| [alicuota](#alicuota)       | `number`  | Optional | cannot be null | [RegimenRetencionUpdateInput](regimenretencionupdateinput-properties-alicuota.md "undefined#/properties/alicuota")       |
| [alicuotaMin](#alicuotamin) | `number`  | Optional | can be null    | [RegimenRetencionUpdateInput](regimenretencionupdateinput-properties-alicuotamin.md "undefined#/properties/alicuotaMin") |
| [nombre](#nombre)           | `string`  | Optional | cannot be null | [RegimenRetencionUpdateInput](regimenretencionupdateinput-properties-nombre.md "undefined#/properties/nombre")           |
| [provincia](#provincia)     | `string`  | Optional | can be null    | [RegimenRetencionUpdateInput](regimenretencionupdateinput-properties-provincia.md "undefined#/properties/provincia")     |

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [RegimenRetencionUpdateInput](regimenretencionupdateinput-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## alicuota



`alicuota`

* is optional

* Type: `number`

* cannot be null

* defined in: [RegimenRetencionUpdateInput](regimenretencionupdateinput-properties-alicuota.md "undefined#/properties/alicuota")

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

* defined in: [RegimenRetencionUpdateInput](regimenretencionupdateinput-properties-alicuotamin.md "undefined#/properties/alicuotaMin")

### alicuotaMin Type

`number`

### alicuotaMin Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## nombre



`nombre`

* is optional

* Type: `string`

* cannot be null

* defined in: [RegimenRetencionUpdateInput](regimenretencionupdateinput-properties-nombre.md "undefined#/properties/nombre")

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

* defined in: [RegimenRetencionUpdateInput](regimenretencionupdateinput-properties-provincia.md "undefined#/properties/provincia")

### provincia Type

`string`

### provincia Constraints

**maximum length**: the maximum number of characters for this string is: `10`
