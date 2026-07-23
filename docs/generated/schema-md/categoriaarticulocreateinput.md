# CategoriaArticuloCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CategoriaArticuloCreateInput.schema.json](../schema-json/CategoriaArticuloCreateInput.schema.json "open original schema") |

## CategoriaArticuloCreateInput Type

`object` ([CategoriaArticuloCreateInput](categoriaarticulocreateinput.md))

# CategoriaArticuloCreateInput Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                                     |
| :------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| [activo](#activo)               | `boolean` | Optional | cannot be null | [CategoriaArticuloCreateInput](categoriaarticulocreateinput-properties-activo.md "undefined#/properties/activo")               |
| [codigo](#codigo)               | `string`  | Optional | cannot be null | [CategoriaArticuloCreateInput](categoriaarticulocreateinput-properties-codigo.md "undefined#/properties/codigo")               |
| [nombre](#nombre)               | `string`  | Required | cannot be null | [CategoriaArticuloCreateInput](categoriaarticulocreateinput-properties-nombre.md "undefined#/properties/nombre")               |
| [padreId](#padreid)             | `integer` | Optional | cannot be null | [CategoriaArticuloCreateInput](categoriaarticulocreateinput-properties-padreid.md "undefined#/properties/padreId")             |
| [precioDefault](#preciodefault) | `number`  | Optional | cannot be null | [CategoriaArticuloCreateInput](categoriaarticulocreateinput-properties-preciodefault.md "undefined#/properties/precioDefault") |

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [CategoriaArticuloCreateInput](categoriaarticulocreateinput-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## codigo



`codigo`

* is optional

* Type: `string`

* cannot be null

* defined in: [CategoriaArticuloCreateInput](categoriaarticulocreateinput-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`string`

### codigo Constraints

**maximum length**: the maximum number of characters for this string is: `20`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [CategoriaArticuloCreateInput](categoriaarticulocreateinput-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `80`

## padreId



`padreId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [CategoriaArticuloCreateInput](categoriaarticulocreateinput-properties-padreid.md "undefined#/properties/padreId")

### padreId Type

`integer`

### padreId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## precioDefault



`precioDefault`

* is optional

* Type: `number`

* cannot be null

* defined in: [CategoriaArticuloCreateInput](categoriaarticulocreateinput-properties-preciodefault.md "undefined#/properties/precioDefault")

### precioDefault Type

`number`

### precioDefault Constraints

**minimum**: the value of this number must greater than or equal to: `0`
