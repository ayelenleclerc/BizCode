# CategoriaArticuloPatchInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CategoriaArticuloPatchInput.schema.json](../schema-json/CategoriaArticuloPatchInput.schema.json "open original schema") |

## CategoriaArticuloPatchInput Type

`object` ([CategoriaArticuloPatchInput](categoriaarticulopatchinput.md))

## CategoriaArticuloPatchInput Constraints

**minimum number of properties**: the minimum number of properties for this object is: `1`

# CategoriaArticuloPatchInput Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                                   |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [activo](#activo)               | `boolean` | Optional | cannot be null | [CategoriaArticuloPatchInput](categoriaarticulopatchinput-properties-activo.md "undefined#/properties/activo")               |
| [codigo](#codigo)               | `string`  | Optional | cannot be null | [CategoriaArticuloPatchInput](categoriaarticulopatchinput-properties-codigo.md "undefined#/properties/codigo")               |
| [nombre](#nombre)               | `string`  | Optional | cannot be null | [CategoriaArticuloPatchInput](categoriaarticulopatchinput-properties-nombre.md "undefined#/properties/nombre")               |
| [padreId](#padreid)             | `integer` | Optional | cannot be null | [CategoriaArticuloPatchInput](categoriaarticulopatchinput-properties-padreid.md "undefined#/properties/padreId")             |
| [precioDefault](#preciodefault) | `number`  | Optional | cannot be null | [CategoriaArticuloPatchInput](categoriaarticulopatchinput-properties-preciodefault.md "undefined#/properties/precioDefault") |

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [CategoriaArticuloPatchInput](categoriaarticulopatchinput-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## codigo



`codigo`

* is optional

* Type: `string`

* cannot be null

* defined in: [CategoriaArticuloPatchInput](categoriaarticulopatchinput-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`string`

### codigo Constraints

**maximum length**: the maximum number of characters for this string is: `20`

## nombre



`nombre`

* is optional

* Type: `string`

* cannot be null

* defined in: [CategoriaArticuloPatchInput](categoriaarticulopatchinput-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `80`

## padreId



`padreId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [CategoriaArticuloPatchInput](categoriaarticulopatchinput-properties-padreid.md "undefined#/properties/padreId")

### padreId Type

`integer`

### padreId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## precioDefault



`precioDefault`

* is optional

* Type: `number`

* cannot be null

* defined in: [CategoriaArticuloPatchInput](categoriaarticulopatchinput-properties-preciodefault.md "undefined#/properties/precioDefault")

### precioDefault Type

`number`

### precioDefault Constraints

**minimum**: the value of this number must greater than or equal to: `0`
