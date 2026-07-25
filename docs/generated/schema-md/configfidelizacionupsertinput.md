# ConfigFidelizacionUpsertInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConfigFidelizacionUpsertInput.schema.json](../schema-json/ConfigFidelizacionUpsertInput.schema.json "open original schema") |

## ConfigFidelizacionUpsertInput Type

`object` ([ConfigFidelizacionUpsertInput](configfidelizacionupsertinput.md))

# ConfigFidelizacionUpsertInput Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                                                               |
| :-------------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| [activo](#activo)                       | `boolean` | Required | cannot be null | [ConfigFidelizacionUpsertInput](configfidelizacionupsertinput-properties-activo.md "undefined#/properties/activo")                       |
| [aplicaEnDescuento](#aplicaendescuento) | `boolean` | Optional | cannot be null | [ConfigFidelizacionUpsertInput](configfidelizacionupsertinput-properties-aplicaendescuento.md "undefined#/properties/aplicaEnDescuento") |
| [mesesVencimiento](#mesesvencimiento)   | `integer` | Optional | cannot be null | [ConfigFidelizacionUpsertInput](configfidelizacionupsertinput-properties-mesesvencimiento.md "undefined#/properties/mesesVencimiento")   |
| [montoMinCompra](#montomincompra)       | `number`  | Optional | cannot be null | [ConfigFidelizacionUpsertInput](configfidelizacionupsertinput-properties-montomincompra.md "undefined#/properties/montoMinCompra")       |
| [nombre](#nombre)                       | `string`  | Optional | cannot be null | [ConfigFidelizacionUpsertInput](configfidelizacionupsertinput-properties-nombre.md "undefined#/properties/nombre")                       |
| [pesosPorPunto](#pesosporpunto)         | `number`  | Required | cannot be null | [ConfigFidelizacionUpsertInput](configfidelizacionupsertinput-properties-pesosporpunto.md "undefined#/properties/pesosPorPunto")         |
| [puntosPorPeso](#puntosporpeso)         | `number`  | Required | cannot be null | [ConfigFidelizacionUpsertInput](configfidelizacionupsertinput-properties-puntosporpeso.md "undefined#/properties/puntosPorPeso")         |

## activo



`activo`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ConfigFidelizacionUpsertInput](configfidelizacionupsertinput-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## aplicaEnDescuento



`aplicaEnDescuento`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [ConfigFidelizacionUpsertInput](configfidelizacionupsertinput-properties-aplicaendescuento.md "undefined#/properties/aplicaEnDescuento")

### aplicaEnDescuento Type

`boolean`

## mesesVencimiento



`mesesVencimiento`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ConfigFidelizacionUpsertInput](configfidelizacionupsertinput-properties-mesesvencimiento.md "undefined#/properties/mesesVencimiento")

### mesesVencimiento Type

`integer`

### mesesVencimiento Constraints

**maximum**: the value of this number must smaller than or equal to: `120`

**minimum**: the value of this number must greater than or equal to: `1`

## montoMinCompra



`montoMinCompra`

* is optional

* Type: `number`

* cannot be null

* defined in: [ConfigFidelizacionUpsertInput](configfidelizacionupsertinput-properties-montomincompra.md "undefined#/properties/montoMinCompra")

### montoMinCompra Type

`number`

### montoMinCompra Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## nombre



`nombre`

* is optional

* Type: `string`

* cannot be null

* defined in: [ConfigFidelizacionUpsertInput](configfidelizacionupsertinput-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `80`

**minimum length**: the minimum number of characters for this string is: `1`

## pesosPorPunto



`pesosPorPunto`

* is required

* Type: `number`

* cannot be null

* defined in: [ConfigFidelizacionUpsertInput](configfidelizacionupsertinput-properties-pesosporpunto.md "undefined#/properties/pesosPorPunto")

### pesosPorPunto Type

`number`

### pesosPorPunto Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## puntosPorPeso



`puntosPorPeso`

* is required

* Type: `number`

* cannot be null

* defined in: [ConfigFidelizacionUpsertInput](configfidelizacionupsertinput-properties-puntosporpeso.md "undefined#/properties/puntosPorPeso")

### puntosPorPeso Type

`number`

### puntosPorPeso Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`
