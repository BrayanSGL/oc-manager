# Gestión de Órdenes de Compra en VBA

Este proyecto contiene un conjunto de macros diseñadas en VBA para automatizar la gestión de órdenes de compra en Microsoft Excel. Incluye funcionalidades para crear órdenes de compra, registrar datos en un archivo CSV, y exportar hojas como archivos PDF.

## Tabla de Contenidos
- [Funciones Principales](#funciones-principales)
  - [CrearNuevaOrden](#crearnuevaorden)
  - [DebugOrdenDeCompra](#debugordendecompra)
  - [RegistrarOrdenEnCSV](#registrarordenencsv)
  - [GuardarOrdenComoPDF](#guardarordencomopdf)
- [Requisitos Previos](#requisitos-previos)
- [Cómo Usar](#cómo-usar)
- [Notas](#notas)

## Funciones Principales

### CrearNuevaOrden

**Descripción:**
Crea una nueva hoja basada en la última hoja del libro, asignando un nombre único que sigue el formato `ST###-2025`. Este nombre se genera incrementando el número consecutivo de la última hoja.

**Código:**
```vba
Sub CrearNuevaOrden()
    ' Verifica el nombre de la última hoja y crea una copia con un nuevo nombre
    ' basado en un número consecutivo.
    Dim ws As Worksheet
    Dim nuevaHoja As Worksheet
    Dim ultimoConsecutivo As Integer
    Dim nuevoNombre As String

    Set ws = ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count)

    If Left(ws.Name, 2) = "ST" And InStr(ws.Name, "-2025") > 0 Then
        ultimoConsecutivo = Val(Mid(ws.Name, 3, InStr(ws.Name, "-2025") - 3))
    Else
        MsgBox "La última hoja no tiene un nombre válido para generar un consecutivo.", vbExclamation
        Exit Sub
    End If

    ws.Copy After:=ws
    Set nuevaHoja = ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count)
    nuevoNombre = "ST" & Format(ultimoConsecutivo + 1, "000") & "-2025"
    nuevaHoja.Name = nuevoNombre
    nuevaHoja.Range("P6").Value = nuevoNombre

    MsgBox "Se ha creado la nueva hoja con el nombre: " & nuevoNombre, vbInformation
End Sub
```

---

### DebugOrdenDeCompra

**Descripción:**
Proporciona información de depuración sobre los datos de la orden de compra, verificando las celdas clave como `P6` (Orden de Compra), `F9` (Proveedor), y la celda del `Sub-Total`.

**Código:**
```vba
Sub DebugOrdenDeCompra()
    Dim celdaSubtotal As Range
    Dim valorNeto As Variant

    Debug.Print "========== Depuración de la Orden de Compra =========="
    Debug.Print "Nombre de la hoja activa: " & ActiveSheet.Name
    Debug.Print "P6 (Orden de Compra): " & ActiveSheet.Range("P6").Value
    Debug.Print "F9 (Proveedor): " & ActiveSheet.Range("F9").Value

    Set celdaSubtotal = ActiveSheet.Cells.Find(What:="Sub-Total", LookIn:=xlValues, LookAt:=xlWhole)
    If celdaSubtotal Is Nothing Then
        Debug.Print "Sub-Total: No encontrado."
    Else
        Debug.Print "Sub-Total encontrado en: " & celdaSubtotal.Address
        valorNeto = celdaSubtotal.Offset(0, 1).Value
        Debug.Print "Valor Neto (a la derecha de Sub-Total): " & valorNeto
    End If

    Debug.Print "========== Fin de la Depuración =========="
    MsgBox "Depuración completada. Revisa la ventana de inmediato (Ctrl+G).", vbInformation
End Sub
```

---

### RegistrarOrdenEnCSV

**Descripción:**
Registra información clave de la orden de compra en un archivo CSV. Si el archivo no existe, se crea junto con los encabezados. Si ya existe, se añaden los datos al final.

**Código:**
```vba
Sub RegistrarOrdenEnCSV()
    Dim rutaCSV As String
    Dim archivoCSV As Object
    Dim fso As Object
    Dim datosRegistro As String
    Dim valorNeto As Variant
    Dim celdaSubtotal As Range

    rutaCSV = "Registro de facturación 2025.csv"  'Cambiar la ruta según sea necesario

    Set celdaSubtotal = ActiveSheet.Cells.Find(What:="Sub-Total", LookIn:=xlValues, LookAt:=xlWhole)
    If Not celdaSubtotal Is Nothing Then
        valorNeto = celdaSubtotal.Offset(0, 1).Value
    Else
        valorNeto = "No encontrado"
    End If

    datosRegistro = _
        Date & "," & _
        ActiveSheet.Range("P6").Value & "," & _
        ActiveSheet.Range("F9").Value & "," & _
        valorNeto

    Set fso = CreateObject("Scripting.FileSystemObject")
    If Not fso.FileExists(rutaCSV) Then
        Set archivoCSV = fso.CreateTextFile(rutaCSV, True)
        archivoCSV.WriteLine "Fecha de creacion,Orden de compra,Proveedor,Valor neto"
    Else
        Set archivoCSV = fso.OpenTextFile(rutaCSV, 8)
    End If

    archivoCSV.WriteLine datosRegistro
    archivoCSV.Close

    MsgBox "Registro guardado en el archivo CSV.", vbInformation
End Sub
```

---

### GuardarOrdenComoPDF

**Descripción:**
Exporta la hoja activa como un archivo PDF, utilizando como nombre el valor de la celda `P6` o el nombre de la hoja si `P6` está vacío.

**Código:**
```vba
Sub GuardarOrdenComoPDF()
    Dim rutaPDF As String
    Dim nombreArchivo As String
    Dim valorP6 As String

    valorP6 = ActiveSheet.Range("P6").Value
    If valorP6 = "" Then
        nombreArchivo = ActiveSheet.Name
    Else
        nombreArchivo = valorP6
    End If

    rutaPDF = ThisWorkbook.Path & "\" & nombreArchivo & ".pdf"

    On Error Resume Next
    ActiveSheet.ExportAsFixedFormat Type:=xlTypePDF, Filename:=rutaPDF, Quality:=xlQualityStandard, IncludeDocProperties:=True, IgnorePrintAreas:=False, OpenAfterPublish:=False
    On Error GoTo 0

    If Dir(rutaPDF) <> "" Then
        MsgBox "La Orden de Compra se ha guardado como PDF en: " & rutaPDF, vbInformation
    Else
        MsgBox "Hubo un problema al guardar el PDF. Verifica los permisos de la carpeta.", vbExclamation
    End If
End Sub
```

## Requisitos Previos
- Microsoft Excel con macros habilitadas.
- Carpeta accesible para guardar el archivo CSV y PDF.
- Familiaridad básica con VBA y el entorno de desarrollo de Excel.

## Cómo Usar
1. Copia el código en el Editor de VBA (Alt + F11).
2. Asigna cada macro a botones en tu hoja de cálculo para una interacción más sencilla.
3. Configura las rutas de los archivos CSV y PDF según tus necesidades.

## Notas
- Asegúrate de que las celdas clave (`P6`, `F9`, y `Sub-Total`) tengan valores válidos.
- Verifica los permisos de las carpetas donde se guardarán los archivos.
- Personaliza los nombres de los archivos y rutas según tu sistema.
