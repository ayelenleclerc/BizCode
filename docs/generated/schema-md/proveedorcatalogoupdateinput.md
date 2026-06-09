# ProveedorCatalogoUpdateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorCatalogoUpdateInput.schema.json](../schema-json/ProveedorCatalogoUpdateInput.schema.json "open original schema") |

## ProveedorCatalogoUpdateInput Type

`object` ([ProveedorCatalogoUpdateInput](proveedorcatalogoupdateinput.md))

# ProveedorCatalogoUpdateInput Properties

| Property                            | Type      | Required | Nullable       | Defined by                                                                                                                         |
| :---------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| [activo](#activo)                   | `boolean` | Optional | cannot be null | [ProveedorCatalogoUpdateInput](proveedorcatalogoupdateinput-properties-activo.md "undefined#/properties/activo")                   |
| [codigoProveedor](#codigoproveedor) | `string`  | Optional | cannot be null | [ProveedorCatalogoUpdateInput](proveedorcatalogoupdateinput-properties-codigoproveedor.md "undefined#/properties/codigoProveedor") |
| [descripcion](#descripcion)         | `string`  | Optional | cannot be null | [ProveedorCatalogoUpdateInput](proveedorcatalogoupdateinput-properties-descripcion.md "undefined#/properties/descripcion")         |
| [multiplo](#multiplo)               | `number`  | Optional | cannot be null | [ProveedorCatalogoUpdateInput](proveedorcatalogoupdateinput-properties-multiplo.md "undefined#/properties/multiplo")               |
| [precioLista](#preciolista)         | `number`  | Optional | cannot be null | [ProveedorCatalogoUpdateInput](proveedorcatalogoupdateinput-properties-preciolista.md "undefined#/properties/precioLista")         |
| [unidadCompra](#unidadcompra)       | `string`  | Optional | cannot be null | [ProveedorCatalogoUpdateInput](proveedorcatalogoupdateinput-properties-unidadcompra.md "undefined#/properties/unidadCompra")       |

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [ProveedorCatalogoUpdateInput](proveedorcatalogoupdateinput-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## codigoProveedor



`codigoProveedor`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorCatalogoUpdateInput](proveedorcatalogoupdateinput-properties-codigoproveedor.md "undefined#/properties/codigoProveedor")

### codigoProveedor Type

`string`

### codigoProveedor Constraints

**maximum length**: the maximum number of characters for this string is: `50`

**minimum length**: the minimum number of characters for this string is: `1`

## descripcion



`descripcion`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorCatalogoUpdateInput](proveedorcatalogoupdateinput-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

### descripcion Constraints

**maximum length**: the maximum number of characters for this string is: `120`

## multiplo



`multiplo`

* is optional

* Type: `number`

* cannot be null

* defined in: [ProveedorCatalogoUpdateInput](proveedorcatalogoupdateinput-properties-multiplo.md "undefined#/properties/multiplo")

### multiplo Type

`number`

### multiplo Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## precioLista



`precioLista`

* is optional

* Type: `number`

* cannot be null

* defined in: [ProveedorCatalogoUpdateInput](proveedorcatalogoupdateinput-properties-preciolista.md "undefined#/properties/precioLista")

### precioLista Type

`number`

### precioLista Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## unidadCompra



`unidadCompra`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorCatalogoUpdateInput](proveedorcatalogoupdateinput-properties-unidadcompra.md "undefined#/properties/unidadCompra")

### unidadCompra Type

`string`

### unidadCompra Constraints

**maximum length**: the maximum number of characters for this string is: `30`
