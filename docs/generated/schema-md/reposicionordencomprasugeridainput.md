# ReposicionOrdenCompraSugeridaInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Forbidden             | none                | [ReposicionOrdenCompraSugeridaInput.schema.json](../schema-json/ReposicionOrdenCompraSugeridaInput.schema.json "open original schema") |

## ReposicionOrdenCompraSugeridaInput Type

`object` ([ReposicionOrdenCompraSugeridaInput](reposicionordencomprasugeridainput.md))

# ReposicionOrdenCompraSugeridaInput Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                                             |
| :-------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| [articuloIds](#articuloids) | `array`   | Required | cannot be null | [ReposicionOrdenCompraSugeridaInput](reposicionordencomprasugeridainput-properties-articuloids.md "undefined#/properties/articuloIds") |
| [create](#create)           | `boolean` | Optional | cannot be null | [ReposicionOrdenCompraSugeridaInput](reposicionordencomprasugeridainput-properties-create.md "undefined#/properties/create")           |
| [horizonDays](#horizondays) | `integer` | Optional | cannot be null | [ReposicionOrdenCompraSugeridaInput](reposicionordencomprasugeridainput-properties-horizondays.md "undefined#/properties/horizonDays") |
| [proveedorId](#proveedorid) | `integer` | Required | cannot be null | [ReposicionOrdenCompraSugeridaInput](reposicionordencomprasugeridainput-properties-proveedorid.md "undefined#/properties/proveedorId") |

## articuloIds



`articuloIds`

* is required

* Type: `integer[]`

* cannot be null

* defined in: [ReposicionOrdenCompraSugeridaInput](reposicionordencomprasugeridainput-properties-articuloids.md "undefined#/properties/articuloIds")

### articuloIds Type

`integer[]`

### articuloIds Constraints

**maximum number of items**: the maximum number of items for this array is: `100`

**minimum number of items**: the minimum number of items for this array is: `1`

## create



`create`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [ReposicionOrdenCompraSugeridaInput](reposicionordencomprasugeridainput-properties-create.md "undefined#/properties/create")

### create Type

`boolean`

## horizonDays



`horizonDays`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ReposicionOrdenCompraSugeridaInput](reposicionordencomprasugeridainput-properties-horizondays.md "undefined#/properties/horizonDays")

### horizonDays Type

`integer`

### horizonDays Constraints

**maximum**: the value of this number must smaller than or equal to: `90`

**minimum**: the value of this number must greater than or equal to: `1`

## proveedorId



`proveedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReposicionOrdenCompraSugeridaInput](reposicionordencomprasugeridainput-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`

### proveedorId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
