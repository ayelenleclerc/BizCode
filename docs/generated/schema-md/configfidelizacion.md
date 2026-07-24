# ConfigFidelizacion Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConfigFidelizacionEnvelope.schema.json\*](../schema-json/ConfigFidelizacionEnvelope.schema.json "open original schema") |

## data Type

`object` ([ConfigFidelizacion](configfidelizacion.md))

# data Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                                         |
| :-------------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [activo](#activo)                       | `boolean` | Required | cannot be null | [ConfigFidelizacion](configfidelizacion-properties-activo.md "undefined#/properties/activo")                       |
| [aplicaEnDescuento](#aplicaendescuento) | `boolean` | Required | cannot be null | [ConfigFidelizacion](configfidelizacion-properties-aplicaendescuento.md "undefined#/properties/aplicaEnDescuento") |
| [createdAt](#createdat)                 | `string`  | Required | cannot be null | [ConfigFidelizacion](configfidelizacion-properties-createdat.md "undefined#/properties/createdAt")                 |
| [id](#id)                               | `integer` | Required | cannot be null | [ConfigFidelizacion](configfidelizacion-properties-id.md "undefined#/properties/id")                               |
| [mesesVencimiento](#mesesvencimiento)   | `integer` | Required | cannot be null | [ConfigFidelizacion](configfidelizacion-properties-mesesvencimiento.md "undefined#/properties/mesesVencimiento")   |
| [montoMinCompra](#montomincompra)       | `number`  | Required | cannot be null | [ConfigFidelizacion](configfidelizacion-properties-montomincompra.md "undefined#/properties/montoMinCompra")       |
| [nombre](#nombre)                       | `string`  | Required | cannot be null | [ConfigFidelizacion](configfidelizacion-properties-nombre.md "undefined#/properties/nombre")                       |
| [pesosPorPunto](#pesosporpunto)         | `number`  | Required | cannot be null | [ConfigFidelizacion](configfidelizacion-properties-pesosporpunto.md "undefined#/properties/pesosPorPunto")         |
| [puntosPorPeso](#puntosporpeso)         | `number`  | Required | cannot be null | [ConfigFidelizacion](configfidelizacion-properties-puntosporpeso.md "undefined#/properties/puntosPorPeso")         |
| [tenantId](#tenantid)                   | `integer` | Required | cannot be null | [ConfigFidelizacion](configfidelizacion-properties-tenantid.md "undefined#/properties/tenantId")                   |
| [updatedAt](#updatedat)                 | `string`  | Required | cannot be null | [ConfigFidelizacion](configfidelizacion-properties-updatedat.md "undefined#/properties/updatedAt")                 |

## activo



`activo`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ConfigFidelizacion](configfidelizacion-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## aplicaEnDescuento



`aplicaEnDescuento`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ConfigFidelizacion](configfidelizacion-properties-aplicaendescuento.md "undefined#/properties/aplicaEnDescuento")

### aplicaEnDescuento Type

`boolean`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ConfigFidelizacion](configfidelizacion-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConfigFidelizacion](configfidelizacion-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## mesesVencimiento



`mesesVencimiento`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConfigFidelizacion](configfidelizacion-properties-mesesvencimiento.md "undefined#/properties/mesesVencimiento")

### mesesVencimiento Type

`integer`

## montoMinCompra



`montoMinCompra`

* is required

* Type: `number`

* cannot be null

* defined in: [ConfigFidelizacion](configfidelizacion-properties-montomincompra.md "undefined#/properties/montoMinCompra")

### montoMinCompra Type

`number`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [ConfigFidelizacion](configfidelizacion-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

## pesosPorPunto



`pesosPorPunto`

* is required

* Type: `number`

* cannot be null

* defined in: [ConfigFidelizacion](configfidelizacion-properties-pesosporpunto.md "undefined#/properties/pesosPorPunto")

### pesosPorPunto Type

`number`

## puntosPorPeso



`puntosPorPeso`

* is required

* Type: `number`

* cannot be null

* defined in: [ConfigFidelizacion](configfidelizacion-properties-puntosporpeso.md "undefined#/properties/puntosPorPeso")

### puntosPorPeso Type

`number`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConfigFidelizacion](configfidelizacion-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ConfigFidelizacion](configfidelizacion-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
