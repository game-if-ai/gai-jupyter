# GAI-Jupyter
React frontend for the Game-If-AI Project

## Jupyter Notebooks
- Every game has a respective Jupyter Notebook.
- The Jupyter notebooks are hosted at https://jupyter-dev.gameifai.org/api/jupyter/lab
- The password to this site can be found in the gai-jupyter 1Password vault.
- Note that the frontend looks for test2.ipynb within the respective activity folder as the notebook to display.
- IMPORTANT: The Jupyter Server is purely used for hosting the notebooks, nothing more. If you try to run the notebooks on the jupyter server, you're going to have a bad time!

### Editing Jupyter Notebooks
To edit a notebook, you use the Jupyter server interface.
Every code block in a Jupyter Notebook requires some metadata to be set.
This metadata can be updated by:
1. Visiting the Jupyter Notebooks server listed above
2. Locating your notebook (activity_name/test2.ipynb)
3. Selecting a code block.
4. Click the Gears icon in the top right of the screen.
5. Dropdown "Advanced Tools"
6. Look for the "Cell Metadata" JSON and make your updates there.

Required metadata fields:
- "editable" if you want to allow the user to edit the cell.
- "hidden" if you want to hide the cell from the user.
- "gai_title" a unique title for the cell, should be a short title for the cell, this is displayed to the user.
- "gai_description" a short description of the cell. This is displayed to the user.
- "gai_cell_type" the type of cell. Either "SETUP", "MODEL", or "VALIDATION". This is used to determine the type of cell and how it should be treated by the app.
    - "SETUP" : The cell that typically sets everything up for the user. Is usually disabled. 
    - "MODEL" the model cell. This is the cell that the user will need to modify. The users cursor will start here.
    - "VALIDATION" : The cell that validates the users output. Is usually disabled. 

### Important notes for creating/editing notebookes
- The notebooks are hosted on the Jupyter Server BUT the code is executed by our own backend.
- Every notebook must start with a code block that only contains `%load_ext pycodestyle_magic`, set this block to hidden.
- Each notebook should only have a max of 4 code blocks (including the previous block.)
    - Block 1: The pycodestyle_magic block mentioned above.
    - Block 2: The SETUP block. This one is optional, but is used most of the time for setting up the users required packages.
    - Block 3: The MODEL block. This block is required. This is the block that the user makes their edits in.
    - Block 4: The VALIDATION block. This block is required. This block validates and outputs the results.
- Every code block (except the previously mentioned block) must have all the data fields.

For each user session, App.tsx generates temporary notebooks for that session in the jupyter server.