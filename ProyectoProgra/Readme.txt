PROYECTO PROGRAMACIÓN WEB - GESTOR DE CONTACTOS Santiago Fallas


Este proyecto consiste en una aplicación web desarrollada con Python y Flask para la gestión de contactos almacenados en un archivo Excel utilizando la librería openpyxl.

FUNCIONALIDADES

* Inicio de sesión.
* Agregar contactos.
* Buscar contactos.
* Editar contactos.
* Eliminar contactos.
* Ver información detallada de contactos.
* Ordenar contactos alfabéticamente.
* Gestión de categorías.
* Reporte general de contactos.
* Almacenamiento de datos en archivo Excel.

REQUISITOS

* Python 3.10 o superior.
* Flask.
* OpenPyXL.

INSTALACIÓN 

pip install flask openpyxl

ESTRUCTURA DEL PROYECTO

Proyecto/
│
├── app.py
├── contactos.xlsx
├── README.txt
│
├── templates/
│   ├── login.html
│   ├── index.html
│   ├── agregar.html
│   ├── editar.html
│   ├── buscar.html
│   ├── detalle.html
│   └── reporte.html
│
└── static/
├── styles/
│   └── styles.css
└── scripts/

EJECUCIÓN DEL PROYECTO

1. Abrir una terminal en la carpeta del proyecto.
2. Ejecutar:

python app.py

3. Abrir el navegador y acceder a:

http://127.0.0.1:5000

CREDENCIALES DE ACCESO

puestas por defecto
